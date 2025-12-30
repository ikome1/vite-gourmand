import { NavLink } from 'react-router-dom';
import type { Menu } from '../types/menu';

interface MenuCardProps {
  menu: Menu;
  onSelect?: (menu: Menu) => void;
}

export function MenuCard({ menu, onSelect }: MenuCardProps) {
  return (
    <article className="menu-card">
      <div className="menu-card__images">
        {menu.images.slice(0, 2).map((src) => (
          <img key={src} src={src} alt={`Illustration du ${menu.title}`} loading="lazy" />
        ))}
      </div>
      <div className="menu-card__body">
        <p className="menu-card__theme">
          {menu.theme} · {menu.regime}
        </p>
        <h3>{menu.title}</h3>
        <p className="menu-card__description">{menu.description}</p>
        <ul className="menu-card__meta">
          <li>
            <span>À partir de</span>
            <strong>{menu.basePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong>
          </li>
          <li>
            <span>Invités minimum</span>
            <strong>{menu.minimumGuests} personnes</strong>
          </li>
          <li>
            <span>Stock disponible</span>
            <strong>{menu.stock}</strong>
          </li>
        </ul>
        {menu.highlight && <p className="menu-card__highlight">{menu.highlight}</p>}
      </div>
      <div className="menu-card__actions">
        <NavLink to={`/menus/${menu.id}`} className="app-button app-button--ghost">
          Voir le détail
        </NavLink>
        <NavLink
          to={`/commande/${menu.id}`}
          className="app-button"
          onClick={() => onSelect?.(menu)}
        >
          Commander
        </NavLink>
      </div>
    </article>
  );
}

