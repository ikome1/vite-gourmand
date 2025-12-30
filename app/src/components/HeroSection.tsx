import { NavLink } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__content">
        <p className="hero__eyebrow">Traiteur événementiel à Bordeaux</p>
        <h1>
          25 ans de gastronomie pour <span>vos événements mémorables</span>
        </h1>
        <p>
          Des menus évolutifs, une logistique maîtrisée et une équipe passionnée. Offrez à vos
          invités une expérience culinaire sur mesure, du dîner intimiste aux grandes réceptions.
        </p>
        <div className="hero__actions">
          <NavLink to="/menus" className="app-button" aria-label="Découvrir tous les menus">
            Découvrir nos menus
          </NavLink>
          <NavLink to="/contact" className="app-button app-button--ghost">
            Nous contacter
          </NavLink>
        </div>
        <ul className="hero__highlights">
          <li>Produits locaux et de saison</li>
          <li>Gestion complète de la prestation</li>
          <li>Accompagnement personnalisé</li>
        </ul>
      </div>
      <div className="hero__visual">
        <img src="/assets/hero-chef.svg" alt="Julie et José en cuisine" />
        <div className="hero__badge">
          <strong>25 ans</strong>
          <span>de savoir-faire</span>
        </div>
      </div>
    </section>
  );
}

