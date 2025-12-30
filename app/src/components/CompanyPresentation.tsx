export function CompanyPresentation() {
  return (
    <section className="company" aria-labelledby="titre-entreprise">
      <div className="company__content">
        <p className="section-eyebrow">Qui sommes-nous ?</p>
        <h2 id="titre-entreprise">Vite & Gourmand, artisans du goût depuis 1999</h2>
        <p>
          Fondé par Julie, cheffe étoilée, et José, maître d’hôtel, notre duo accompagne les
          entreprises et les particuliers sur Bordeaux et sa région. Nous composons des menus
          évolutifs inspirés des saisons et construisons des expériences culinaires adaptées à vos
          contraintes logistiques.
        </p>
        <p>
          Notre engagement : associer réactivité, créativité et sécurité alimentaire. Chaque menu
          est testé, documenté et livré avec une traçabilité complète. Nous élaborons des fiches
          allergènes détaillées afin d’informer vos convives en toute transparence.
        </p>
        <ul className="company__list">
          <li>25 ans d’existence</li>
          <li>Équipe formée aux normes HACCP</li>
          <li>Service client disponible 7j/7</li>
        </ul>
      </div>
      <aside className="company__aside">
        <div className="company__badge">
          <strong>Nouvelle carte</strong>
          <span>Menus Chef d’hiver 2025 disponibles</span>
        </div>
        <div className="company__card">
          <h3>Notre démarche RSE</h3>
          <p>
            Approvisionnement local, réduction des déchets alimentaires, emballages consignés et
            récupération des surplus via les associations partenaires.
          </p>
        </div>
      </aside>
    </section>
  );
}

