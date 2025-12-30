import { NavLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>Page introuvable</h1>
      <p>
        La page demandée n’existe pas ou a été déplacée. Utilisez le menu pour continuer votre
        navigation.
      </p>
      <NavLink to="/" className="app-button">
        Retour à l’accueil
      </NavLink>
    </div>
  );
}

