import { useEffect, useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Menu } from '../types/menu';
import { calculateOrderPricePreview } from '../utils/priceCalculator';

interface OrderFormState {
  eventDate: string;
  guests: number;
  notes: string;
  deliveryAddress: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const initialState: OrderFormState = {
  eventDate: '',
  guests: 0,
  notes: '',
  deliveryAddress: '',
};

export function OrderPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const { currentUser, token } = useAuth();
  const [formState, setFormState] = useState<OrderFormState>(initialState);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!menuId) {
      setMenuError('Menu introuvable.');
      setLoadingMenu(false);
      return;
    }

    let cancelled = false;
    setLoadingMenu(true);
    setMenuError(null);

    async function fetchMenu() {
      try {
        const response = await fetch(`${API_BASE}/api/menus/${menuId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message ?? 'Menu introuvable.');
        }
        if (!cancelled) {
          setMenu(data.data);
          setFormState((prev) => ({
            ...prev,
            guests: data.data.minimumGuests,
            deliveryAddress: prev.deliveryAddress || currentUser?.address || '',
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setMenuError((err as Error).message ?? 'Impossible de charger ce menu.');
        }
      } finally {
        if (!cancelled) {
          setLoadingMenu(false);
        }
      }
    }

    fetchMenu();
    return () => {
      cancelled = true;
    };
  }, [menuId, currentUser?.address]);

  if (loadingMenu) {
    return (
      <div className="order-page__not-found">
        <p>Chargement du menu…</p>
      </div>
    );
  }

  if (!menu || menuError) {
    return (
      <div className="order-page__not-found">
        <h1>Menu introuvable</h1>
        <p>{menuError ?? 'Ce menu n’est plus disponible.'}</p>
        <NavLink to="/menus" className="app-button">
          Retour aux menus
        </NavLink>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="order-page__unauthorized">
        <h1>Connexion requise</h1>
        <p>
          Vous devez être connecté pour commander le menu <strong>{menu.title}</strong>.
        </p>
        <div className="order-page__actions">
          <NavLink to="/connexion" className="app-button">
            Se connecter
          </NavLink>
          <NavLink to="/inscription" className="app-button app-button--ghost">
            Créer un compte
          </NavLink>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setFeedback({
        message: 'Impossible de valider la commande : veuillez vous reconnecter.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menuId: menu.id,
          eventDate: formState.eventDate,
          guests: formState.guests,
          deliveryAddress: formState.deliveryAddress,
          notes: formState.notes || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message ?? 'Impossible d’enregistrer la commande.');
      }

      setFeedback({
        message: data.message ?? 'Commande enregistrée. Notre équipe revient vers vous très vite.',
        type: 'success',
      });
      setFormState({
        eventDate: '',
        guests: menu.minimumGuests,
        notes: '',
        deliveryAddress: currentUser.address,
      });
    } catch (err) {
      setFeedback({
        message: (err as Error).message ?? 'Erreur réseau lors de la commande.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-page">
      <header className="order-page__header">
        <h1>Commander le {menu.title}</h1>
        <p>
          Résumé pré-rempli à partir du menu sélectionné. Une confirmation vous sera envoyée sous 24h
          par Julie ou José afin de finaliser les derniers détails.
        </p>
      </header>

      <div className="order-page__summary">
        <h2>Détails du menu choisi</h2>
        <ul>
          <li>
            <strong>Thème :</strong> {menu.theme}
          </li>
          <li>
            <strong>Régime :</strong> {menu.regime}
          </li>
          <li>
            <strong>Invités minimum :</strong> {menu.minimumGuests}
          </li>
          <li>
            <strong>Prix de base :</strong>{' '}
            {menu.basePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </li>
          {menu.pricePerAdditionalGuest && (
            <li>
              <strong>Prix par convive supplémentaire :</strong>{' '}
              {menu.pricePerAdditionalGuest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </li>
          )}
        </ul>
      </div>

      <PriceCalculationDisplay
        menu={menu}
        guests={formState.guests}
        deliveryAddress={formState.deliveryAddress}
      />

      <section className="order-page__form">
        <h2>Informations logistiques</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group form-group--inline">
            <div>
              <label htmlFor="order-eventDate">Date de l’événement</label>
              <input
                id="order-eventDate"
                type="date"
                required
                value={formState.eventDate}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, eventDate: event.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="order-guests">Nombre d’invités</label>
              <input
                id="order-guests"
                type="number"
                min={menu.minimumGuests}
                required
                value={formState.guests}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    guests: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="order-address">Adresse de livraison</label>
            <input
              id="order-address"
              required
              value={formState.deliveryAddress}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, deliveryAddress: event.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="order-notes">Notes spécifiques</label>
            <textarea
              id="order-notes"
              rows={5}
              placeholder="Allergies, contraintes horaires, logistique supplémentaire…"
              value={formState.notes}
              onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
          <button type="submit" className="app-button app-button--large" disabled={submitting}>
            {submitting ? 'Envoi en cours…' : 'Envoyer la demande de commande'}
          </button>
        </form>
        {feedback && (
          <p role="status" className={feedback.type === 'error' ? 'form-feedback' : 'form-success'}>
            {feedback.message}
          </p>
        )}
      </section>
    </div>
  );
}

interface PriceCalculationDisplayProps {
  menu: Menu;
  guests: number;
  deliveryAddress: string;
}

function PriceCalculationDisplay({ menu, guests, deliveryAddress }: PriceCalculationDisplayProps) {
  const priceCalculation = useMemo(() => {
    return calculateOrderPricePreview(
      menu.basePrice,
      menu.pricePerAdditionalGuest || 0,
      menu.minimumGuests,
      guests,
      deliveryAddress || ''
    );
  }, [menu, guests, deliveryAddress]);

  if (guests < menu.minimumGuests) {
    return null;
  }

  return (
    <div className="order-page__price-calculation">
      <h2>Récapitulatif du prix</h2>
      <div className="price-breakdown">
        <div className="price-line">
          <span>Prix de base ({menu.minimumGuests} personnes) :</span>
          <span>{menu.basePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        </div>
        {priceCalculation.breakdown.additionalGuests > 0 && (
          <>
            <div className="price-line">
              <span>
                {priceCalculation.breakdown.additionalGuests} personne(s) supplémentaire(s) ×{' '}
                {(menu.pricePerAdditionalGuest || 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
                :
              </span>
              <span>
                {priceCalculation.breakdown.additionalPrice.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </div>
            <div className="price-line price-line--subtotal">
              <span>Sous-total menu :</span>
              <span>
                {priceCalculation.menuPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </>
        )}
        {priceCalculation.discountAmount > 0 && (
          <div className="price-line price-line--discount">
            <span>
              Réduction {priceCalculation.breakdown.discountPercentage}% (5+ personnes supplémentaires) :
            </span>
            <span>
              -{priceCalculation.discountAmount.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          </div>
        )}
        <div className="price-line price-line--subtotal">
          <span>Prix menu après réduction :</span>
          <span>
            {priceCalculation.menuPriceAfterDiscount.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
        <div className="price-line">
          <span>Livraison :</span>
          <span>
            {priceCalculation.deliveryPrice === 0
              ? 'Gratuite (Bordeaux)'
              : priceCalculation.deliveryPrice.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
          </span>
        </div>
        <div className="price-line price-line--total">
          <span>
            <strong>Total :</strong>
          </span>
          <span>
            <strong>
              {priceCalculation.totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}

