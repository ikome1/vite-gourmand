import { useEffect, useState } from 'react';
import { useMenuContext } from '../context/MenuContext';
import { useDebounce } from '../hooks/useDebounce';
import type { MenuFilters, MenuRegime, MenuTheme } from '../types/menu';

const themes: (MenuTheme | 'Tous')[] = ['Tous', 'Noël', 'Pâques', 'Classique', 'Événement', 'Mariage', 'Brunch'];
const regimes: (MenuRegime | 'Tous')[] = ['Tous', 'Classique', 'Végétarien', 'Vegan', 'Sans gluten', 'Pescetarien'];

export function MenuFilters() {
  const { filters, setFilters, resetFilters } = useMenuContext();
  const [localFilters, setLocalFilters] = useState<MenuFilters>(filters);
  // État local pour la recherche (non debouncé)
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  
  // Debounce la recherche avec un délai de 500ms
  const debouncedSearch = useDebounce(searchValue, 500);

  // Synchroniser les états locaux avec les filtres globaux (sauf pour la recherche qui est gérée par le debounce)
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...filters,
      search: prev.search, // On garde la valeur locale pour la recherche
    }));
    // Ne synchroniser searchValue que si les filtres changent depuis l'extérieur (ex: reset)
    if (filters.search !== debouncedSearch && filters.search !== searchValue) {
      setSearchValue(filters.search ?? '');
    }
  }, [filters, debouncedSearch, searchValue]);

  // Mettre à jour les filtres uniquement quand la recherche debouncée change
  useEffect(() => {
    setFilters({ search: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Le debounce garantit que cette valeur change seulement après le délai

  const handleChange = <K extends keyof MenuFilters>(key: K, value: MenuFilters[K]) => {
    const nextFilters = { ...localFilters, [key]: value };
    setLocalFilters(nextFilters);
    
    // Pour la recherche, on ne met pas à jour immédiatement (géré par le debounce)
    if (key !== 'search') {
      setFilters({ [key]: value });
    }
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
        <div className="menu-filters__search-wrapper">
          <input
            id="menu-search"
            type="search"
            placeholder="Nom, description, allergènes..."
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
              setLocalFilters({ ...localFilters, search: event.target.value });
            }}
            className={searchValue !== debouncedSearch ? 'search-input--searching' : ''}
          />
          {searchValue !== debouncedSearch && (
            <span className="search-indicator" aria-hidden="true">⏳</span>
          )}
        </div>
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

