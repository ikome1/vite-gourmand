# Améliorations pour rendre le site plus dynamique

## 🔍 Problèmes identifiés

Le site utilise déjà React avec des appels API, mais il manque :
1. **Debounce sur la recherche** : La recherche déclenche une requête à chaque caractère tapé
2. **Animations/transitions** : Pas de transitions visuelles lors des changements d'état
3. **Feedback visuel** : Les interactions ne donnent pas assez de feedback immédiat
4. **États de chargement** : Manque de skeleton loaders ou spinners

---

## 💡 Solutions proposées

### 1. Ajouter un debounce pour la recherche (PRIORITÉ HAUTE)

**Problème** : Actuellement, chaque caractère tapé dans la recherche déclenche une requête API immédiate.

**Solution** : Utiliser un debounce pour attendre que l'utilisateur arrête de taper.

#### Implémentation

**Option A : Utiliser une bibliothèque (recommandé)**
```bash
cd app
npm install use-debounce
```

**Option B : Créer un hook custom**

Créer `app/src/hooks/useDebounce.ts` :
```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Modifier `MenuFilters.tsx`** :
```typescript
import { useDebounce } from '../hooks/useDebounce';

export function MenuFilters() {
  const { filters, setFilters, resetFilters } = useMenuContext();
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  
  // Debounce la valeur de recherche
  const debouncedSearch = useDebounce(searchValue, 500);
  
  // Mettre à jour les filtres seulement quand la valeur debouncée change
  useEffect(() => {
    setFilters({ search: debouncedSearch || undefined });
  }, [debouncedSearch, setFilters]);
  
  return (
    // ...
    <input
      type="search"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder="Rechercher..."
    />
    // ...
  );
}
```

**Pourquoi ?**
- ✅ Réduit le nombre de requêtes API
- ✅ Améliore les performances
- ✅ Expérience utilisateur plus fluide

---

### 2. Ajouter des animations CSS (PRIORITÉ MOYENNE)

**Problème** : Les changements d'état (chargement, erreur, données) apparaissent brutalement.

**Solution** : Ajouter des transitions CSS pour des animations fluides.

#### Ajouter dans `global.css` :

```css
/* Animations pour les transitions d'état */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Appliquer les animations */
.menus-page__grid {
  animation: fadeIn 0.3s ease-out;
}

.menu-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

/* Animation pour les listes */
.menus-page__grid > * {
  animation: fadeIn 0.4s ease-out;
  animation-fill-mode: both;
}

.menus-page__grid > *:nth-child(1) { animation-delay: 0.05s; }
.menus-page__grid > *:nth-child(2) { animation-delay: 0.1s; }
.menus-page__grid > *:nth-child(3) { animation-delay: 0.15s; }
.menus-page__grid > *:nth-child(4) { animation-delay: 0.2s; }

/* Transitions pour les filtres */
.menu-filters {
  transition: opacity 0.3s ease;
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  border: 3px solid var(--color-muted);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;
}
```

---

### 3. Skeleton Loaders (PRIORITÉ MOYENNE)

**Problème** : Le message "Chargement..." n'est pas assez visuel.

**Solution** : Créer des skeleton loaders qui imitent la structure des données.

#### Créer `app/src/components/MenuCardSkeleton.tsx` :

```typescript
export function MenuCardSkeleton() {
  return (
    <article className="menu-card menu-card--skeleton">
      <div className="menu-card__image skeleton-image" />
      <div className="menu-card__content">
        <div className="skeleton-text skeleton-text--title" />
        <div className="skeleton-text skeleton-text--line" />
        <div className="skeleton-text skeleton-text--line skeleton-text--short" />
        <div className="menu-card__footer">
          <div className="skeleton-text skeleton-text--price" />
        </div>
      </div>
    </article>
  );
}
```

#### Ajouter dans `global.css` :

```css
/* Skeleton loading styles */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-image,
.skeleton-text {
  background: linear-gradient(
    90deg,
    var(--color-muted) 0px,
    #e8e8e8 40px,
    var(--color-muted) 80px
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
}

.skeleton-text {
  height: 1rem;
  margin-bottom: 0.75rem;
}

.skeleton-text--title {
  height: 1.5rem;
  width: 70%;
}

.skeleton-text--line {
  width: 100%;
}

.skeleton-text--short {
  width: 60%;
}

.skeleton-text--price {
  width: 40%;
  height: 1.25rem;
}

.menu-card--skeleton {
  pointer-events: none;
}
```

#### Utiliser dans `MenusPage.tsx` :

```typescript
import { MenuCardSkeleton } from '../components/MenuCardSkeleton';

export function MenusPage() {
  const { menus, loading, error } = useMenuContext();
  
  return (
    // ...
    {loading && (
      <div className="menus-page__grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <MenuCardSkeleton key={index} />
        ))}
      </div>
    )}
    // ...
  );
}
```

---

### 4. Améliorer les feedbacks utilisateur (PRIORITÉ MOYENNE)

**Problème** : Les actions utilisateur (filtres, recherche) ne donnent pas de feedback immédiat.

**Solution** : Ajouter des indicateurs visuels et des messages de feedback.

#### A. Indicateur de recherche en cours

Dans `MenuFilters.tsx` :
```typescript
const [isSearching, setIsSearching] = useState(false);

useEffect(() => {
  if (searchValue !== debouncedSearch) {
    setIsSearching(true);
  } else {
    setIsSearching(false);
  }
}, [searchValue, debouncedSearch]);

// Dans le JSX :
<input
  type="search"
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  className={isSearching ? 'search-input--searching' : ''}
/>
{isSearching && <span className="search-indicator">Recherche...</span>}
```

#### B. Compteur de résultats en temps réel

Dans `MenusPage.tsx` :
```typescript
const { menus, loading, error, filters } = useMenuContext();
const hasActiveFilters = filters.theme !== 'Tous' || 
                         filters.regime !== 'Tous' || 
                         filters.search;

return (
  <header className="menus-page__list-header">
    <h2>
      {loading ? (
        'Recherche en cours...'
      ) : (
        `${menus.length} menu${menus.length > 1 ? 's' : ''} trouvé${menus.length > 1 ? 's' : ''}`
      )}
      {hasActiveFilters && !loading && (
        <span className="filter-indicator"> (filtres actifs)</span>
      )}
    </h2>
  </header>
);
```

---

### 5. Améliorer la réactivité des filtres (PRIORITÉ BASSE)

**Problème** : Les filtres peuvent être plus réactifs visuellement.

**Solution** : Ajouter des transitions et des états visuels.

#### Dans `MenuFilters.tsx` :

```typescript
// Ajouter un état pour les filtres actifs
const hasActiveFilters = 
  filters.theme !== 'Tous' ||
  filters.regime !== 'Tous' ||
  filters.maxPrice ||
  filters.priceRange ||
  filters.search;

// Dans le JSX du bouton reset :
<button
  type="button"
  className={`app-button app-button--ghost ${!hasActiveFilters ? 'app-button--disabled' : ''}`}
  onClick={handleReset}
  disabled={!hasActiveFilters}
>
  Réinitialiser
  {hasActiveFilters && <span className="badge">{activeFilterCount}</span>}
</button>
```

---

## 📝 Plan d'implémentation

### Phase 1 - Améliorations critiques (2-3h)
1. ✅ Ajouter le debounce sur la recherche
2. ✅ Créer le hook `useDebounce`

### Phase 2 - Améliorations visuelles (3-4h)
3. ✅ Ajouter les animations CSS
4. ✅ Créer les skeleton loaders
5. ✅ Intégrer les skeleton loaders dans les pages

### Phase 3 - Feedback utilisateur (2-3h)
6. ✅ Indicateur de recherche en cours
7. ✅ Compteur de résultats en temps réel
8. ✅ Améliorer les boutons de filtres

---

## 🎯 Résultat attendu

Après ces améliorations, le site sera :
- ✅ Plus fluide (recherche debouncée)
- ✅ Plus visuel (animations, skeleton loaders)
- ✅ Plus réactif (feedback immédiat)
- ✅ Plus professionnel (expérience utilisateur améliorée)

---

## 💻 Commandes à exécuter

```bash
# Installer la bibliothèque de debounce (option A)
cd app
npm install use-debounce

# Ou créer le hook custom (option B - recommandé pour la formation)
# Pas besoin d'installer de dépendance
```

---

## 📚 Justification pédagogique

**Pour le jury** :
> "J'ai amélioré l'interactivité du site en ajoutant un debounce sur la recherche pour éviter les requêtes API excessives, des animations CSS pour une meilleure expérience visuelle, et des skeleton loaders pour donner un feedback immédiat lors du chargement. Ces améliorations rendent l'interface plus réactive et professionnelle."

