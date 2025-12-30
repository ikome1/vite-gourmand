const highlights = [
  {
    id: 'logistique',
    title: 'Logistique maîtrisée',
    description:
      'Gestion du matériel, coordination des fournisseurs et chef de projet dédié pour chaque événement.',
    icon: '🚚',
  },
  {
    id: 'qualite',
    title: 'Qualité certifiée',
    description:
      'Produits frais issus de producteurs locaux, respect strict de la chaîne du froid et des normes HACCP.',
    icon: '✅',
  },
  {
    id: 'personnalisation',
    title: 'Menus sur mesure',
    description:
      'Création de menus personnalisés selon la saison, les régimes alimentaires et les contraintes budgétaires.',
    icon: '🎯',
  },
];

export function ExpertiseHighlights() {
  return (
    <section className="highlights" aria-labelledby="titre-professionnalisme">
      <div className="section-header">
        <p className="section-eyebrow">Savoir-faire</p>
        <h2 id="titre-professionnalisme">Professionnalisme de l’équipe</h2>
        <p>
          Julie, cheffe passionnée, et José, maître d’hôtel, orchestrent vos réceptions avec
          la même exigence qu’un service gastronomique.
        </p>
      </div>

      <div className="highlights__grid">
        {highlights.map((item) => (
          <article key={item.id} className="highlight-card">
            <span className="highlight-card__icon" aria-hidden="true">
              {item.icon}
            </span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

