import { useMemo } from 'react';
import { MenuCard } from '../components/MenuCard';
import { MenuFilters } from '../components/MenuFilters';
import { useMenuContext } from '../context/MenuContext';

export function MenusPage() {
  const { menus, loading, error } = useMenuContext();

  const title = useMemo(() => {
    const count = menus.length;
    return `${count} menu${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`;
  }, [menus.length]);

  return (
    <div className="menus-page">
      <header className="menus-page__header">
        <h1>Nos menus</h1>
        <p>
          Filtrez par thème, régime alimentaire ou budget pour trouver l’offre qui correspond à
          votre événement. Les cartes sont mises à jour en temps réel par nos équipes.
        </p>
      </header>

      <div className="menus-page__layout">
        <MenuFilters />

        <section className="menus-page__list" aria-live="polite">
          <header className="menus-page__list-header">
            <h2>{title}</h2>
            <p>Les informations sont consultables sans connexion. La commande nécessite un compte.</p>
          </header>

          {loading && (
            <div className="menus-page__empty">
              <p>Chargement des menus…</p>
            </div>
          )}

          {error && !loading && (
            <div className="menus-page__empty">
              <p>{error}</p>
              <p>Veuillez réessayer dans quelques instants.</p>
            </div>
          )}

          {!loading && !error && menus.length === 0 && (
            <div className="menus-page__empty">
              <p>Aucun menu ne correspond aux filtres sélectionnés.</p>
              <p>
                Essayez d’ajuster votre budget ou d’élargir la sélection de thèmes. Nos équipes peuvent
                aussi concevoir un menu sur mesure.
              </p>
            </div>
          )}

          {!loading && !error && menus.length > 0 && (
            <div className="menus-page__grid">
              {menus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

