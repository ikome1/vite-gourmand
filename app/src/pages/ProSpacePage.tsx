import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, useIsAuthorized } from '../context/AuthContext';
import { useMenuContext } from '../context/MenuContext';
import type { MenuRegime, MenuTheme, NewMenuInput } from '../types/menu';

const themes: MenuTheme[] = ['Noël', 'Pâques', 'Classique', 'Événement', 'Mariage', 'Brunch'];
const regimes: MenuRegime[] = ['Classique', 'Végétarien', 'Vegan', 'Sans gluten', 'Pescetarien'];

const defaultFormState: NewMenuInput = {
  title: '',
  description: '',
  theme: 'Classique',
  regime: 'Classique',
  minimumGuests: 10,
  basePrice: 250,
  pricePerAdditionalGuest: 25,
  stock: 5,
  images: ['/assets/menu-generic.svg'],
  highlight: '',
  conditions: {
    orderingNotice: 'Commande minimale 5 jours avant l’événement.',
    storage: 'Conserver entre 0 et 4°C. Réchauffer à 120°C si nécessaire.',
  },
};

export function ProSpacePage() {
  const authorized = useIsAuthorized(['administrateur', 'employe']);
  const { currentUser } = useAuth();
  const { menus, createMenu, updateMenuStock } = useMenuContext();
  const [formState, setFormState] = useState<NewMenuInput>(defaultFormState);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingStocks, setPendingStocks] = useState<Record<string, number | undefined>>({});

  const sortedMenus = useMemo(() => {
    return [...menus].sort((a, b) => a.title.localeCompare(b.title));
  }, [menus]);

  if (!authorized) {
    return (
      <div className="pro-space__unauthorized">
        <h1>Accès restreint</h1>
        <p>
          Cet espace est réservé aux collaborateurs de Vite & Gourmand. Connectez-vous avec un
          compte employé ou administrateur, ou contactez votre responsable FastDev.
        </p>
        {!currentUser && (
          <NavLink to="/connexion" className="app-button">
            Se connecter
          </NavLink>
        )}
      </div>
    );
  }

  const handleStockBlur = async (id: string) => {
    const value = pendingStocks[id];
    if (value === undefined || Number.isNaN(value)) {
      return;
    }

    const currentStock = menus.find((menu) => menu.id === id)?.stock;
    if (currentStock === value) {
      setPendingStocks((prev) => ({ ...prev, [id]: undefined }));
      return;
    }

    const { success, message } = await updateMenuStock(id, value);
    setFeedback({ message, type: success ? 'success' : 'error' });
    if (success) {
      setPendingStocks((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleAddMenu = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setFeedback(null);

    const payload: NewMenuInput = {
      ...formState,
      highlight: formState.highlight?.trim() ? formState.highlight : undefined,
      conditions: {
        orderingNotice: formState.conditions?.orderingNotice?.trim() || undefined,
        storage: formState.conditions?.storage?.trim() || undefined,
        notes: formState.conditions?.notes?.trim() || undefined,
      },
      images: formState.images?.filter((url) => url.trim().length > 0),
    };

    const { success, message } = await createMenu(payload);
    setFeedback({ message, type: success ? 'success' : 'error' });
    if (success) {
      setFormState(defaultFormState);
    }
    setCreating(false);
  };

  return (
    <div className="pro-space">
      <header className="pro-space__header">
        <h1>Espace professionnel</h1>
        <p>
          Gestion simple des stocks, des tarifs et ajout rapide d’un menu. Les modifications sont
          immédiatement visibles côté visiteurs.
        </p>
      </header>

      <section className="pro-space__section">
        <h2>Navigation rapide</h2>
        <div className="pro-space__shortcuts">
          <NavLink to="/menus" className="app-button app-button--ghost">
            Menus
          </NavLink>
          <NavLink to="/gestion-commandes" className="app-button">
            Gérer les commandes
          </NavLink>
          <NavLink to="/gestion-avis" className="app-button app-button--ghost">
            Valider les avis
          </NavLink>
          {currentUser.role === 'administrateur' && (
            <NavLink to="/admin" className="app-button app-button--primary">
              Administration
            </NavLink>
          )}
          <NavLink to="/contact" className="app-button app-button--ghost">
            Contact
          </NavLink>
        </div>
      </section>

      <section className="pro-space__section">
        <h2>Stock & prix</h2>
        <div className="pro-space__table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Menu</th>
                <th>Thème</th>
                <th>Régime</th>
                <th>Invités min.</th>
                <th>Prix de base</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {sortedMenus.map((menu) => (
                <tr key={menu.id}>
                  <td>{menu.title}</td>
                  <td>{menu.theme}</td>
                  <td>{menu.regime}</td>
                  <td>{menu.minimumGuests}</td>
                  <td>{menu.basePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={
                        pendingStocks[menu.id] !== undefined ? pendingStocks[menu.id] : menu.stock
                      }
                      onChange={(event) =>
                        setPendingStocks((prev) => ({
                          ...prev,
                          [menu.id]: Number(event.target.value),
                        }))
                      }
                      onBlur={() => handleStockBlur(menu.id)}
                    />
                  </td>
                  <td>
                    <NavLink
                      to={`/menus/${menu.id}/modifier`}
                      className="app-button app-button--ghost app-button--small"
                    >
                      Modifier
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pro-space__section">
        <h2>Ajouter un menu</h2>
        <form className="pro-space__form" onSubmit={handleAddMenu}>
          <div className="form-group">
            <label htmlFor="pro-title">Titre</label>
            <input
              id="pro-title"
              required
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pro-description">Description</label>
            <textarea
              id="pro-description"
              rows={3}
              required
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <div className="form-group form-group--inline">
            <div>
              <label htmlFor="pro-theme">Thème</label>
              <select
                id="pro-theme"
                value={formState.theme}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, theme: event.target.value as MenuTheme }))
                }
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pro-regime">Régime</label>
              <select
                id="pro-regime"
                value={formState.regime}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, regime: event.target.value as MenuRegime }))
                }
              >
                {regimes.map((regime) => (
                  <option key={regime} value={regime}>
                    {regime}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group form-group--inline">
            <div>
              <label htmlFor="pro-minimumGuests">Personnes minimum</label>
              <input
                id="pro-minimumGuests"
                type="number"
                min={1}
                value={formState.minimumGuests}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    minimumGuests: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label htmlFor="pro-basePrice">Prix de base (€)</label>
              <input
                id="pro-basePrice"
                type="number"
                min={0}
                step={10}
                value={formState.basePrice}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    basePrice: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label htmlFor="pro-stock">Stock disponible</label>
              <input
                id="pro-stock"
                type="number"
                min={0}
                value={formState.stock ?? 0}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    stock: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="form-group form-group--inline">
            <div>
              <label htmlFor="pro-pricePlus">Prix par convive supplémentaire (€)</label>
              <input
                id="pro-pricePlus"
                type="number"
                min={0}
                step={5}
                value={formState.pricePerAdditionalGuest ?? 0}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    pricePerAdditionalGuest: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label htmlFor="pro-highlight">Accroche commerciale</label>
              <input
                id="pro-highlight"
                placeholder="Optionnel"
                value={formState.highlight ?? ''}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    highlight: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="pro-images">Images (séparées par des virgules)</label>
            <input
              id="pro-images"
              value={formState.images?.join(', ') ?? ''}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  images: event.target.value
                    .split(',')
                    .map((value) => value.trim())
                    .filter((value) => value.length > 0),
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="pro-conditions-order">Conditions de commande</label>
            <textarea
              id="pro-conditions-order"
              rows={2}
              value={formState.conditions?.orderingNotice ?? ''}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  conditions: {
                    ...prev.conditions,
                    orderingNotice: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="pro-conditions-storage">Conseils de stockage</label>
            <textarea
              id="pro-conditions-storage"
              rows={2}
              value={formState.conditions?.storage ?? ''}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  conditions: {
                    ...prev.conditions,
                    storage: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="pro-conditions-notes">Notes complémentaires</label>
            <textarea
              id="pro-conditions-notes"
              rows={2}
              placeholder="Optionnel"
              value={formState.conditions?.notes ?? ''}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  conditions: {
                    ...prev.conditions,
                    notes: event.target.value,
                  },
                }))
              }
            />
          </div>
          <button type="submit" className="app-button" disabled={creating}>
            {creating ? 'Ajout en cours…' : 'Ajouter le menu'}
          </button>
        </form>
        {feedback && (
          <p className={feedback.type === 'error' ? 'form-feedback' : 'form-success'}>{feedback.message}</p>
        )}
      </section>
    </div>
  );
}

