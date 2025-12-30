import { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { MenuTheme, MenuRegime, NewMenuInput } from '../types/menu';
import { useMenuContext } from '../context/MenuContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const themes: MenuTheme[] = ['Noël', 'Pâques', 'Classique', 'Événement', 'Mariage', 'Brunch'];
const regimes: MenuRegime[] = ['Classique', 'Végétarien', 'Vegan', 'Sans gluten', 'Pescetarien'];

export function MenuEditPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const { menus } = useMenuContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formState, setFormState] = useState<NewMenuInput>({
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
      orderingNotice: 'Commande 5 jours avant l\'événement.',
      storage: 'Conserver entre 0°C et 4°C.',
    },
  });

  useEffect(() => {
    if (!menuId) {
      setLoading(false);
      return;
    }

    const menu = menus.find((m) => m.id === menuId);
    if (menu) {
      setFormState({
        title: menu.title,
        description: menu.description,
        theme: menu.theme,
        regime: menu.regime,
        minimumGuests: menu.minimumGuests,
        basePrice: menu.basePrice,
        pricePerAdditionalGuest: menu.pricePerAdditionalGuest,
        stock: menu.stock,
        images: menu.images,
        highlight: menu.highlight,
        conditions: menu.conditions,
      });
      setLoading(false);
    } else {
      setError('Menu introuvable.');
      setLoading(false);
    }
  }, [menuId, menus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !menuId) return;

    setSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE}/api/menus/${menuId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour.');
      }

      setFeedback({ message: 'Menu mis à jour avec succès.', type: 'success' });
      setTimeout(() => {
        navigate('/espace-pro');
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !menuId || !confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/api/menus/${menuId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression.');
      }

      navigate('/espace-pro');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  if (!currentUser || !['administrateur', 'employe'].includes(currentUser.role)) {
    return (
      <div className="menu-edit__unauthorized">
        <h1>Accès refusé</h1>
        <NavLink to="/" className="app-button">
          Retour à l'accueil
        </NavLink>
      </div>
    );
  }

  if (loading) {
    return <div className="menu-edit__loading">Chargement...</div>;
  }

  if (error && !menuId) {
    return (
      <div className="menu-edit__error">
        <h1>Menu introuvable</h1>
        <NavLink to="/espace-pro" className="app-button">
          Retour à l'espace pro
        </NavLink>
      </div>
    );
  }

  return (
    <div className="menu-edit">
      <header className="menu-edit__header">
        <NavLink to="/espace-pro" className="back-button">
          ← Retour à l'espace pro
        </NavLink>
        <h1>Modifier le menu</h1>
        <button
          type="button"
          className="app-button app-button--secondary"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Suppression...' : 'Supprimer ce menu'}
        </button>
      </header>

      <form className="menu-edit__form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="edit-title">Titre</label>
          <input
            id="edit-title"
            required
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-description">Description</label>
          <textarea
            id="edit-description"
            rows={5}
            required
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
          />
        </div>

        <div className="form-group form-group--inline">
          <div>
            <label htmlFor="edit-theme">Thème</label>
            <select
              id="edit-theme"
              value={formState.theme}
              onChange={(e) => setFormState({ ...formState, theme: e.target.value as MenuTheme })}
            >
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-regime">Régime</label>
            <select
              id="edit-regime"
              value={formState.regime}
              onChange={(e) => setFormState({ ...formState, regime: e.target.value as MenuRegime })}
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
            <label htmlFor="edit-minimumGuests">Invités minimum</label>
            <input
              id="edit-minimumGuests"
              type="number"
              min={1}
              required
              value={formState.minimumGuests}
              onChange={(e) => setFormState({ ...formState, minimumGuests: Number(e.target.value) })}
            />
          </div>
          <div>
            <label htmlFor="edit-basePrice">Prix de base (€)</label>
            <input
              id="edit-basePrice"
              type="number"
              min={0}
              step={10}
              required
              value={formState.basePrice}
              onChange={(e) => setFormState({ ...formState, basePrice: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group form-group--inline">
          <div>
            <label htmlFor="edit-pricePerAdditionalGuest">Prix par convive supplémentaire (€)</label>
            <input
              id="edit-pricePerAdditionalGuest"
              type="number"
              min={0}
              step={5}
              value={formState.pricePerAdditionalGuest || ''}
              onChange={(e) =>
                setFormState({ ...formState, pricePerAdditionalGuest: Number(e.target.value) || undefined })
              }
            />
          </div>
          <div>
            <label htmlFor="edit-stock">Stock</label>
            <input
              id="edit-stock"
              type="number"
              min={0}
              required
              value={formState.stock}
              onChange={(e) => setFormState({ ...formState, stock: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edit-highlight">Mise en avant (optionnel)</label>
          <input
            id="edit-highlight"
            value={formState.highlight || ''}
            onChange={(e) => setFormState({ ...formState, highlight: e.target.value || undefined })}
            placeholder="Texte de mise en avant"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-orderingNotice">Conditions de commande</label>
          <input
            id="edit-orderingNotice"
            value={formState.conditions?.orderingNotice || ''}
            onChange={(e) =>
              setFormState({
                ...formState,
                conditions: { ...formState.conditions, orderingNotice: e.target.value },
              })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-storage">Conditions de stockage</label>
          <input
            id="edit-storage"
            value={formState.conditions?.storage || ''}
            onChange={(e) =>
              setFormState({
                ...formState,
                conditions: { ...formState.conditions, storage: e.target.value },
              })
            }
          />
        </div>

        {error && <p className="form-feedback">{error}</p>}
        {feedback && (
          <p className={feedback.type === 'error' ? 'form-feedback' : 'form-success'}>{feedback.message}</p>
        )}

        <div className="menu-edit__actions">
          <NavLink to="/espace-pro" className="app-button app-button--ghost">
            Annuler
          </NavLink>
          <button type="submit" className="app-button" disabled={submitting}>
            {submitting ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}

