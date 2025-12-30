import { NavLink } from 'react-router-dom';

const schedule = [
  { day: 'Lundi', hours: '8h00 - 19h00' },
  { day: 'Mardi', hours: '8h00 - 19h00' },
  { day: 'Mercredi', hours: '8h00 - 19h00' },
  { day: 'Jeudi', hours: '8h00 - 21h00' },
  { day: 'Vendredi', hours: '8h00 - 21h00' },
  { day: 'Samedi', hours: '9h00 - 21h00' },
  { day: 'Dimanche', hours: '9h00 - 15h00' },
];

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__about">
          <img src="/assets/logo-vite-gourmand.svg" alt="" height={56} />
          <p>
            Vite & Gourmand accompagne vos événements depuis 25 ans avec une cuisine généreuse et
            créative réalisée par Julie & José. Menus sur mesure, sourcing local et logistique
            sans faille.
          </p>
        </div>

        <div className="app-footer__hours">
          <h4>Horaires</h4>
          <ul>
            {schedule.map((item) => (
              <li key={item.day}>
                <span>{item.day}</span>
                <span>{item.hours}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="app-footer__links">
          <h4>Informations</h4>
          <ul>
            <li>
              <NavLink to="/mentions-legales">Mentions légales</NavLink>
            </li>
            <li>
              <NavLink to="/conditions-generales">Conditions générales de vente</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
            <li>
              <a href="mailto:contact@vite-gourmand.fr">contact@vite-gourmand.fr</a>
            </li>
            <li>
              <a href="tel:+33556000000">+33 5 56 00 00 00</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="app-footer__bottom">
        <p>© {new Date().getFullYear()} Vite & Gourmand — Tous droits réservés.</p>
        <p>FastDev · Projet réalisé dans un cadre pédagogique.</p>
      </div>
    </footer>
  );
}

