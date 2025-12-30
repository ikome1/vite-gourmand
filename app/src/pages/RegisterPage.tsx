import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await register(formData);
    setFeedback(result.message);
    if (result.success) {
      navigate('/menus');
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-page__card">
        <h1>Créer un compte</h1>
        <p>
          Rejoignez Vite & Gourmand pour commander en ligne, suivre vos demandes et sauvegarder vos
          préférences alimentaires.
        </p>
        <form onSubmit={handleSubmit} className="auth-page__form">
          <div className="form-group">
            <label htmlFor="register-firstName">Prénom</label>
            <input
              id="register-firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-lastName">Nom</label>
            <input
              id="register-lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Adresse e-mail</label>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-phone">Numéro de GSM</label>
            <input
              id="register-phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-address">Adresse postale</label>
            <input
              id="register-address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Mot de passe</label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              minLength={10}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <small>
              Minimum 10 caractères, avec au moins une majuscule, une minuscule, un chiffre et un
              caractère spécial.
            </small>
          </div>
          <button type="submit" className="app-button app-button--large" disabled={status === 'loading'}>
            {status === 'loading' ? 'Création en cours…' : 'Créer mon compte'}
          </button>
        </form>
        {feedback && <p className="form-feedback">{feedback}</p>}
      </section>
      <aside className="auth-page__aside">
        <h2>Déjà inscrit ?</h2>
        <NavLink to="/connexion" className="app-button app-button--ghost">
          Se connecter
        </NavLink>
      </aside>
    </div>
  );
}

