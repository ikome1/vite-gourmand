import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function EditProfilePage() {
  const { currentUser, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formState, setFormState] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormState({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentUser) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/api/users/me`, {
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

      setSuccess(true);
      // Recharger la page pour mettre à jour les données utilisateur
      setTimeout(() => {
        window.location.href = '/mon-espace';
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="edit-profile__unauthorized">
        <h1>Connexion requise</h1>
        <p>Vous devez être connecté pour modifier votre profil.</p>
        <NavLink to="/connexion" className="app-button">
          Se connecter
        </NavLink>
      </div>
    );
  }

  return (
    <div className="edit-profile">
      <header className="edit-profile__header">
        <NavLink to="/mon-espace" className="back-button">
          ← Retour à mon espace
        </NavLink>
        <h1>Modifier mes informations</h1>
      </header>

      <form className="edit-profile__form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            value={currentUser.email}
            disabled
            className="input-disabled"
          />
          <small>L'email ne peut pas être modifié.</small>
        </div>

        <div className="form-group form-group--inline">
          <div>
            <label htmlFor="profile-firstName">Prénom *</label>
            <input
              id="profile-firstName"
              type="text"
              required
              value={formState.firstName}
              onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="profile-lastName">Nom *</label>
            <input
              id="profile-lastName"
              type="text"
              required
              value={formState.lastName}
              onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="profile-phone">Téléphone</label>
          <input
            id="profile-phone"
            type="tel"
            value={formState.phone}
            onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
            placeholder="Ex: 06 12 34 56 78"
          />
        </div>

        <div className="form-group">
          <label htmlFor="profile-address">Adresse</label>
          <textarea
            id="profile-address"
            rows={3}
            value={formState.address}
            onChange={(e) => setFormState({ ...formState, address: e.target.value })}
            placeholder="Adresse complète"
          />
        </div>

        {error && <p className="form-feedback">{error}</p>}
        {success && (
          <p className="form-success">Vos informations ont été mises à jour avec succès !</p>
        )}

        <div className="edit-profile__actions">
          <NavLink to="/mon-espace" className="app-button app-button--ghost">
            Annuler
          </NavLink>
          <button type="submit" className="app-button" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}

