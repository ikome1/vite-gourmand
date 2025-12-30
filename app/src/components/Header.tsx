import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/menus', label: 'Menus' },
  { to: '/contact', label: 'Contact' },
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/conditions-generales', label: 'CGV' },
];

export function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" className="app-header__brand">
          <img src="/assets/logo-vite-gourmand.svg" alt="Vite & Gourmand" height={48} />
        </NavLink>

        <nav className="app-header__nav" aria-label="Navigation principale">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `app-header__nav-link ${isActive ? 'app-header__nav-link--active' : ''}`
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header__actions">
          {currentUser ? (
            <>
              <span className="app-header__welcome">
                Bonjour, {currentUser.firstName}{' '}
                <span className="app-header__role">({currentUser.role})</span>
              </span>
              <NavLink to="/espace-pro" className="app-button app-button--ghost">
                Mon espace
              </NavLink>
              <button type="button" className="app-button app-button--secondary" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/connexion" className="app-button app-button--ghost">
                Connexion
              </NavLink>
              <NavLink to="/inscription" className="app-button">
                Créer un compte
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

