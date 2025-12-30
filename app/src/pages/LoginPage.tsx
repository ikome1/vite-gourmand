import { useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, status, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const from = (location.state as { from?: string } | undefined)?.from ?? '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const result = await login({ email, password });
    if (result.success) {
      setFeedback(result.message);
      navigate(from, { replace: true });
    } else {
      setFeedback(result.message);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-page__card">
        <h1>Connexion</h1>
        <p>Accédez à votre espace pour commander, gérer vos menus ou mettre à jour votre profil.</p>
        <form onSubmit={handleSubmit} className="auth-page__form">
          <div className="form-group">
            <label htmlFor="login-email">Adresse e-mail</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="auth-page__links">
            <NavLink to="/mot-de-passe-oublie">Mot de passe oublié ?</NavLink>
          </div>
          <button type="submit" className="app-button app-button--large" disabled={status === 'loading'}>
            {status === 'loading' ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>
        {(feedback || error) && <p className="form-feedback">{feedback ?? error}</p>}
      </section>
      <aside className="auth-page__aside">
        <h2>Pas encore de compte ?</h2>
        <p>
          Créez votre compte en quelques clics pour commander vos menus et accéder à l’historique de
          vos événements.
        </p>
        <NavLink to="/inscription" className="app-button app-button--ghost">
          Créer un compte
        </NavLink>
      </aside>
    </div>
  );
}

