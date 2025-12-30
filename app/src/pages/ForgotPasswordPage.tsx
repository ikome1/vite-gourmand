import { useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await resetPassword(email);
    setFeedback(result.message);
  };

  return (
    <div className="auth-page">
      <section className="auth-page__card">
        <h1>Réinitialiser mon mot de passe</h1>
        <p>
          Indiquez votre adresse e-mail. Nous vous enverrons un lien sécurisé pour choisir un nouveau
          mot de passe (simulation).
        </p>
        <form onSubmit={handleSubmit} className="auth-page__form">
          <div className="form-group">
            <label htmlFor="reset-email">Adresse e-mail</label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <button type="submit" className="app-button app-button--large">
            Recevoir le lien de réinitialisation
          </button>
        </form>
        {feedback && <p className="form-feedback">{feedback}</p>}
        <div className="auth-page__links">
          <NavLink to="/connexion">Retour à la connexion</NavLink>
        </div>
      </section>
    </div>
  );
}

