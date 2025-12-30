import { useEffect, useState } from 'react';
import { useMenuContext } from '../context/MenuContext';
import type { MenuFilters, MenuRegime, MenuTheme } from '../types/menu';

const themes: (MenuTheme | 'Tous')[] = ['Tous', 'Noël', 'Pâques', 'Classique', 'Événement', 'Mariage', 'Brunch'];
const regimes: (MenuRegime | 'Tous')[] = ['Tous', 'Classique', 'Végétarien', 'Vegan', 'Sans gluten', 'Pescetarien'];

export function MenuFilters() {
  const { filters, setFilters, resetFilters } = useMenuContext();
  const [localFilters, setLocalFilters] = useState<MenuFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = <K extends keyof MenuFilters>(key: K, value: MenuFilters[K]) => {
    const nextFilters = { ...localFilters, [key]: value };
    setLocalFilters(nextFilters);
    setFilters({ [key]: value });
  };

  const handleRangeChange = (min: number | undefined, max: number | undefined) => {
    const range =
      typeof min === 'number' && typeof max === 'number' && min <= max ? ([min, max] as [number, number]) : undefined;
    handleChange('priceRange', range);
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <aside className="menu-filters" aria-label="Filtres de recherche de menus">
      <div className="menu-filters__header">
        <h2>Filtrer les menus</h2>
        <button type="button" className="app-button app-button--ghost" onClick={handleReset}>
          Réinitialiser
        </button>
      </div>

      <div className="menu-filters__group">
        <label htmlFor="menu-search">Rechercher</label>
        <input
          id="menu-search"
          type="search"
          placeholder="Nom, description, allergènes..."
          value={localFilters.search ?? ''}
          onChange={(event) => handleChange('search', event.target.value)}
        />
      </div>

      <div className="menu-filters__group">
        <label htmlFor="menu-theme">Thème</label>
        <select
          id="menu-theme"
          value={localFilters.theme ?? 'Tous'}
          onChange={(event) => handleChange('theme', event.target.value as MenuTheme | 'Tous')}
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div className="menu-filters__group">
        <label htmlFor="menu-regime">Régime</label>
        <select
          id="menu-regime"
          value={localFilters.regime ?? 'Tous'}
          onChange={(event) => handleChange('regime', event.target.value as MenuRegime | 'Tous')}
        >
          {regimes.map((regime) => (
            <option key={regime} value={regime}>
              {regime}
            </option>
          ))}
        </select>
      </div>

      <div className="menu-filters__group">
        <label htmlFor="menu-max-price">Prix maximum (€)</label>
        <input
          id="menu-max-price"
          type="number"
          min={0}
          step={10}
          value={localFilters.maxPrice ?? ''}
          onChange={(event) => handleChange('maxPrice', event.target.value ? Number(event.target.value) : undefined)}
        />
      </div>

      <div className="menu-filters__group menu-filters__group--range">
        <label>Fourchette de prix (€)</label>
        <div className="menu-filters__range-inputs">
          <input
            type="number"
            placeholder="Min"
            min={0}
            step={10}
            value={localFilters.priceRange?.[0] ?? ''}
            onChange={(event) =>
              handleRangeChange(
                event.target.value ? Number(event.target.value) : undefined,
                localFilters.priceRange?.[1],
              )
            }
          />
          <span>à</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            step={10}
            value={localFilters.priceRange?.[1] ?? ''}
            onChange={(event) =>
              handleRangeChange(
                localFilters.priceRange?.[0],
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </div>
      </div>

      <div className="menu-filters__group">
        <label htmlFor="menu-min-guests">Nombre de personnes minimum</label>
        <input
          id="menu-min-guests"
          type="number"
          min={1}
          step={1}
          value={localFilters.minimumGuests ?? ''}
          onChange={(event) =>
            handleChange('minimumGuests', event.target.value ? Number(event.target.value) : undefined)
          }
        />
      </div>
    </aside>
  );
}

