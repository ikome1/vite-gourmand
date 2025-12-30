import { NavLink } from 'react-router-dom';
import { CompanyPresentation } from '../components/CompanyPresentation';
import { ExpertiseHighlights } from '../components/ExpertiseHighlights';
import { HeroSection } from '../components/HeroSection';
import { Testimonials } from '../components/Testimonials';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CompanyPresentation />
      <ExpertiseHighlights />
      <section className="cta-block">
        <div className="cta-block__content">
          <h2>Menus évolutifs, adaptés à chaque saison</h2>
          <p>
            Nous renouvelons notre carte tous les deux mois afin de valoriser les producteurs
            locaux. Découvrez les thèmes disponibles et composez un menu qui vous ressemble.
          </p>
        </div>
        <NavLink to="/menus" className="app-button app-button--large">
          Explorer les menus
        </NavLink>
      </section>
      <Testimonials />
    </>
  );
}

