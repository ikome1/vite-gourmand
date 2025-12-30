import { NavLink } from 'react-router-dom';
import type { Dish, Menu } from '../types/menu';

interface MenuDetailContentProps {
  menu: Menu;
  isAuthenticated: boolean;
}

function renderDish(dish: Dish) {
  return (
    <li key={dish.id} className="menu-detail__dish">
      <div>
        <h4>
          {dish.name} {dish.isSignature && <span className="menu-detail__signature">Signature</span>}
        </h4>
        <p>{dish.description}</p>
      </div>
      {dish.allergens.length > 0 ? (
        <p className="menu-detail__allergens">
          Allergènes : <strong>{dish.allergens.join(', ')}</strong>
        </p>
      ) : (
        <p className="menu-detail__allergens">Sans allergène majeur</p>
      )}
    </li>
  );
}

export function MenuDetailContent({ menu, isAuthenticated }: MenuDetailContentProps) {
  const courses = menu.courses ?? {
    entrees: [],
    plats: [],
    desserts: [],
  };

  return (
    <section className="menu-detail">
      <header className="menu-detail__header">
        <div>
          <p className="menu-detail__theme">
            {menu.theme} · {menu.regime}
          </p>
          <h1>{menu.title}</h1>
          <p className="menu-detail__description">{menu.description}</p>
        </div>
        <div className="menu-detail__summary">
          <div>
            <span>À partir de</span>
            <strong>{menu.basePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong>
          </div>
          <div>
            <span>Invités minimum</span>
            <strong>{menu.minimumGuests}</strong>
          </div>
          <div>
            <span>Stock disponible</span>
            <strong>{menu.stock}</strong>
          </div>
        </div>
      </header>

      <div className="menu-detail__gallery">
        {menu.images.map((src) => (
          <img key={src} src={src} alt={`Illustration du ${menu.title}`} loading="lazy" />
        ))}
      </div>

      <section className="menu-detail__conditions" aria-labelledby="titre-conditions">
        <h2 id="titre-conditions">Conditions à respecter</h2>
        <ul>
          <li>
            <strong>Commande :</strong> {menu.conditions.orderingNotice}
          </li>
          <li>
            <strong>Stockage :</strong> {menu.conditions.storage}
          </li>
          {menu.conditions.notes && (
            <li>
              <strong>Informations complémentaires :</strong> {menu.conditions.notes}
            </li>
          )}
        </ul>
        <p className="menu-detail__warning">
          Merci de vous assurer que ces conditions sont compatibles avec votre logistique. Notre
          équipe reste disponible pour toute précision.
        </p>
      </section>

      <section className="menu-detail__courses" aria-labelledby="titre-courses">
        <h2 id="titre-courses">Composition du menu</h2>
        <div className="menu-detail__course-group">
          <h3>Entrées</h3>
          <ul>{courses.entrees.map(renderDish)}</ul>
        </div>
        <div className="menu-detail__course-group">
          <h3>Plats</h3>
          <ul>{courses.plats.map(renderDish)}</ul>
        </div>
        <div className="menu-detail__course-group">
          <h3>Desserts</h3>
          <ul>{courses.desserts.map(renderDish)}</ul>
        </div>
      </section>

      <div className="menu-detail__cta">
        <p>
          En cliquant sur commander, votre sélection sera pré-remplie dans le formulaire dédié. Le
          solde et les ajustements seront validés par notre équipe sous 24h.
        </p>
        {isAuthenticated ? (
          <NavLink to={`/commande/${menu.id}`} className="app-button">
            Commander ce menu
          </NavLink>
        ) : (
          <NavLink to="/connexion" className="app-button">
            Se connecter pour commander
          </NavLink>
        )}
      </div>
    </section>
  );
}

