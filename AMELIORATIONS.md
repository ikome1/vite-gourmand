# Analyse et Propositions d'Améliorations
## Projet Vite & Gourmand - Conformité Référentiel RNCP

---

## 📊 ÉTAT DES LIEUX ACTUEL

### ✅ Points forts existants

1. **Architecture séparée** : Front-end (React/TypeScript/Vite) et Back-end (Express/SQLite) bien distincts
2. **Base de données relationnelle** : Schéma SQLite structuré avec clés étrangères, vues, contraintes
3. **API REST** : Endpoints structurés avec validation (Zod)
4. **Types TypeScript** : Typage côté front-end
5. **Contextes React** : Gestion d'état avec AuthContext et MenuContext
6. **Sécurité de base** : Authentification, rôles, validation des entrées

### ❌ Points à améliorer (critiques)

1. **Docker** : Absent (obligatoire pour la formation)
2. **Documentation de déploiement** : Incomplète pour Docker
3. **Structure de projet** : Peut être optimisée
4. **Accessibilité** : À renforcer (ARIA, navigation clavier)
5. **HTML sémantique** : À vérifier et améliorer
6. **CSS responsive** : Présent mais peut être amélioré
7. **Séparation des couches backend** : Services à mieux organiser
8. **Variables d'environnement** : Configuration à standardiser
9. **Maquettes/Wireframes** : Documentation à créer
10. **Documentation API** : Manquante ou incomplète

---

## 🎯 ACTIVITÉ 1 - FRONT-END

### 1.1 Installer et configurer l'environnement de travail

#### 📌 État actuel
- ✅ Node.js configuré
- ✅ Vite + React + TypeScript installés
- ❌ Docker manquant

#### 💡 Améliorations proposées

**A. Ajouter Docker pour le front-end**

Créer un `Dockerfile` dans `app/` :

```dockerfile
# app/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Stage de production avec serveur nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx (optionnel)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Pourquoi ?**
- ✅ Environnement reproductible
- ✅ Isolation des dépendances
- ✅ Facilité de déploiement
- ✅ Conforme aux pratiques DevOps

**B. Créer un fichier `.dockerignore`**

```dockerignore
# app/.dockerignore
node_modules
dist
.env
.env.local
*.log
.git
.gitignore
README.md
```

**C. Variables d'environnement standardisées**

Créer `app/.env.example` :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:4000

# Environnement (development, production)
VITE_ENV=development
```

**Action à justifier** :
> "J'ai containerisé le front-end avec Docker pour garantir un environnement de développement identique pour tous les développeurs et faciliter le déploiement. L'utilisation d'un Dockerfile multi-stage optimise la taille de l'image finale en ne conservant que les fichiers nécessaires à l'exécution."

---

### 1.2 Proposer une structure de projet claire

#### 📌 État actuel
Structure basique mais fonctionnelle :
```
app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── styles/
│   ├── types/
│   └── utils/
```

#### 💡 Améliorations proposées

**Réorganiser selon les bonnes pratiques** :

```
app/
├── public/
├── src/
│   ├── assets/          # Images, icônes, fonts
│   ├── components/
│   │   ├── common/      # Composants réutilisables (Button, Input, Card)
│   │   ├── layout/      # Header, Footer, AppLayout
│   │   └── features/    # Composants spécifiques (MenuCard, MenuFilters)
│   ├── pages/
│   ├── context/
│   ├── hooks/           # Custom hooks réutilisables
│   ├── services/        # Appels API centralisés
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── components/
│   ├── types/
│   ├── utils/
│   │   ├── api.ts       # Configuration API
│   │   ├── storage.ts
│   │   └── validation.ts
│   └── App.tsx
├── Dockerfile
├── docker-compose.yml   # Pour développement local
├── .env.example
└── package.json
```

**Pourquoi ?**
- ✅ Séparation claire des responsabilités
- ✅ Facilité de maintenance
- ✅ Scalabilité améliorée
- ✅ Conforme aux standards React

**Action à justifier** :
> "J'ai réorganisé la structure du projet pour suivre une architecture modulaire basée sur les features. Cette organisation facilite la maintenance, la réutilisation des composants et respecte les bonnes pratiques de développement React."

---

### 1.3 Maquetter des interfaces utilisateur

#### 📌 État actuel
- ❌ Pas de documentation de maquettes
- ❌ Pas de wireframes

#### 💡 Améliorations proposées

**A. Créer un dossier `docs/wireframes/`**

Structure proposée :
```
docs/
├── wireframes/
│   ├── home-page.png / .fig
│   ├── menus-page.png
│   ├── menu-detail.png
│   ├── login-register.png
│   └── README.md (description des maquettes)
└── maquettes/ (si design final disponible)
```

**B. Documenter les maquettes dans `docs/WIREFRAMES.md`**

```markdown
# Wireframes - Vite & Gourmand

## 1. Page d'accueil
- Zone hero avec image principale
- Section présentation entreprise
- Section expertise
- Section témoignages
- Footer

## 2. Page catalogue menus
- Filtres latéraux (thème, régime, prix, nombre de convives)
- Grille de cartes menus
- État vide / chargement / erreur

## 3. Page détail menu
- Image du menu
- Informations principales (titre, description, prix)
- Liste des plats par catégorie (entrées, plats, desserts)
- Allergènes
- Conditions (commande, stockage)
- Bouton commander

## 4. Pages authentification
- Formulaire login
- Formulaire inscription
- Récupération mot de passe

[Créer les wireframes avec Figma, Balsamiq, ou outils similaires]
```

**C. Utiliser un outil de design**

- **Figma** (gratuit, collaboratif)
- **Balsamiq** (wireframes basse fidélité)
- **Draw.io** (gratuit, simple)

**Pourquoi ?**
- ✅ Communication claire des besoins
- ✅ Validation avant développement
- ✅ Référence pour l'implémentation
- ✅ Démonstration de compétences en UX

**Action à justifier** :
> "J'ai créé des wireframes pour chaque page principale de l'application afin de documenter l'ergonomie et la structure des interfaces avant l'implémentation. Ces maquettes servent de référence pour garantir la cohérence de l'expérience utilisateur."

---

### 1.4 Améliorer l'ergonomie et l'UX

#### 📌 État actuel
- ✅ Design cohérent avec variables CSS
- ⚠️ Accessibilité à améliorer
- ⚠️ Feedback utilisateur à renforcer

#### 💡 Améliorations proposées

**A. Accessibilité (WCAG 2.1 niveau AA)**

1. **Navigation au clavier**
   - Vérifier que tous les éléments interactifs sont accessibles
   - Ajouter `tabindex` si nécessaire
   - Gérer le focus visible

2. **Labels et ARIA**
   - Ajouter `aria-label` aux boutons iconiques
   - Utiliser `aria-describedby` pour les messages d'erreur
   - Ajouter `role` appropriés (navigation, banner, main, contentinfo)

3. **Contraste des couleurs**
   - Vérifier le ratio de contraste (minimum 4.5:1 pour le texte)
   - Utiliser des outils comme [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Exemple d'amélioration dans `Header.tsx`** :

```typescript
<nav className="app-header__nav" role="navigation" aria-label="Navigation principale">
  {links.map((link) => (
    <NavLink
      key={link.to}
      to={link.to}
      className={({ isActive }) =>
        `app-header__nav-link ${isActive ? 'app-header__nav-link--active' : ''}`
      }
      aria-current={isActive ? 'page' : undefined}
    >
      {link.label}
    </NavLink>
  ))}
</nav>
```

**B. Feedback utilisateur amélioré**

1. **États de chargement**
   - Skeleton loaders pour les listes
   - Spinners avec texte descriptif

2. **Messages d'erreur**
   - Messages clairs et actionnables
   - Affichage proche du champ concerné
   - Utilisation de `role="alert"` pour les erreurs critiques

3. **Confirmations d'actions**
   - Toast notifications pour les succès
   - Confirmations pour actions destructives

**C. Responsive design renforcé**

Vérifier et améliorer le CSS avec des media queries :

```css
/* Exemple d'amélioration responsive */
@media (max-width: 768px) {
  .app-header__inner {
    flex-direction: column;
    gap: 1rem;
  }
  
  .app-header__nav {
    flex-direction: column;
    width: 100%;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
```

**Pourquoi ?**
- ✅ Inclusion et accessibilité
- ✅ Conformité légale (RGAA)
- ✅ Meilleure expérience utilisateur
- ✅ Référencement amélioré (SEO)

**Action à justifier** :
> "J'ai renforcé l'accessibilité de l'application en ajoutant des attributs ARIA, en garantissant la navigation au clavier et en vérifiant les contrastes de couleurs. Ces améliorations permettent à tous les utilisateurs, y compris ceux utilisant des technologies d'assistance, d'utiliser l'application efficacement."

---

### 1.5 Réaliser des interfaces utilisateur statiques

#### 📌 État actuel
- ✅ HTML généré par React (TSX)
- ⚠️ Sémantique HTML à vérifier
- ✅ CSS avec variables
- ⚠️ Responsive à optimiser

#### 💡 Améliorations proposées

**A. HTML sémantique**

Vérifier l'utilisation de :
- `<header>`, `<nav>`, `<main>`, `<footer>`
- `<article>`, `<section>`, `<aside>`
- `<h1>` à `<h6>` avec hiérarchie correcte
- `<form>`, `<fieldset>`, `<legend>`
- Listes `<ul>`, `<ol>`, `<dl>` appropriées

**Exemple d'amélioration dans `HomePage.tsx`** :

```typescript
return (
  <main>
    <section aria-labelledby="hero-heading">
      <HeroSection />
    </section>
    
    <section aria-labelledby="presentation-heading">
      <h2 id="presentation-heading">Notre entreprise</h2>
      <CompanyPresentation />
    </section>
    
    <section aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading">Témoignages clients</h2>
      <Testimonials />
    </section>
  </main>
);
```

**B. CSS responsive amélioré**

1. **Mobile First** : Commencer par le mobile, puis ajouter les breakpoints desktop

2. **Breakpoints standardisés** :
```css
/* app/src/styles/variables.css */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

3. **Flexbox/Grid** :
   - Utiliser CSS Grid pour les layouts complexes
   - Flexbox pour les alignements simples

**C. Optimisation CSS**

1. **Organisation par composants** :
```
styles/
├── global.css
├── variables.css
├── components/
│   ├── header.css
│   ├── footer.css
│   ├── menu-card.css
│   └── forms.css
└── utilities.css
```

2. **Réduire la duplication** avec des classes utilitaires

**Pourquoi ?**
- ✅ Meilleure sémantique = meilleur SEO
- ✅ Accessibilité améliorée
- ✅ Code maintenable
- ✅ Performance optimisée

**Action à justifier** :
> "J'ai amélioré la sémantique HTML en utilisant les balises appropriées (header, nav, main, section, article) et en structurant correctement la hiérarchie des titres. Le CSS a été optimisé avec une approche mobile-first et l'utilisation de Grid et Flexbox pour des layouts responsives."

---

### 1.6 Développer la partie dynamique des interfaces

#### 📌 État actuel
- ✅ React avec hooks
- ✅ Contextes pour l'état global
- ✅ Appels API avec fetch
- ⚠️ Gestion d'erreurs à améliorer
- ⚠️ Service API centralisé manquant

#### 💡 Améliorations proposées

**A. Créer un service API centralisé**

Créer `app/src/services/api.ts` :

```typescript
// app/src/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `Erreur HTTP ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  // Authentication
  register: (payload: RegisterPayload) =>
    apiRequest<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  login: (payload: LoginPayload) =>
    apiRequest<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  logout: (token: string) =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
      token,
    }),
  
  getCurrentUser: (token: string) =>
    apiRequest<{ user: User }>('/api/auth/me', { token }),
  
  // Menus
  getMenus: (filters?: MenuFilters) => {
    const params = new URLSearchParams();
    // Construire les paramètres...
    return apiRequest<{ data: Menu[] }>(`/api/menus?${params}`);
  },
  
  getMenu: (id: string) =>
    apiRequest<{ data: Menu }>(`/api/menus/${id}`),
  
  // ... autres endpoints
};
```

**B. Custom hooks pour simplifier l'utilisation**

Créer `app/src/hooks/useApi.ts` :

```typescript
// app/src/hooks/useApi.ts
import { useState, useEffect } from 'react';

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    apiCall()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, dependencies);
  
  return { data, loading, error };
}
```

**C. Gestion des événements améliorée**

1. **Debounce pour la recherche** :
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value: string) => {
  setFilters({ search: value });
}, 300);
```

2. **Validation côté client** avant envoi API

**Pourquoi ?**
- ✅ Code réutilisable
- ✅ Gestion d'erreurs centralisée
- ✅ Maintenance facilitée
- ✅ Tests plus simples

**Action à justifier** :
> "J'ai créé un service API centralisé qui encapsule tous les appels vers le backend. Cette architecture facilite la maintenance, permet une gestion d'erreurs cohérente et simplifie l'ajout de fonctionnalités comme la retry logic ou le cache."

---

## 🗄️ ACTIVITÉ 2 - BACK-END

### 2.1 Mettre en place une base de données relationnelle

#### 📌 État actuel
- ✅ Schéma SQLite bien structuré
- ✅ Relations avec clés étrangères
- ✅ Contraintes et vues
- ⚠️ Documentation du modèle manquante

#### 💡 Améliorations proposées

**A. Créer un document de modèle de données**

Créer `server/docs/MODELE_DONNEES.md` :

```markdown
# Modèle de données - Vite & Gourmand

## Entités principales

### 1. Users (Utilisateurs)
- **Clé primaire** : id (TEXT)
- **Attributs** : first_name, last_name, email (UNIQUE), phone, address, role, password_hash
- **Contraintes** : role IN ('utilisateur', 'employe', 'administrateur')

### 2. Menus
- **Clé primaire** : id (TEXT)
- **Relations** :
  - 1-N avec menu_images
  - N-N avec dishes via menu_dishes
- **Attributs** : title, description, theme, regime, base_price, stock, etc.

### 3. Dishes (Plats)
- **Clé primaire** : id (TEXT)
- **Relations** :
  - N-N avec menus via menu_dishes
  - N-N avec allergens via dish_allergens
- **Attributs** : name, description, course_type, is_signature

### 4. Orders (Commandes)
- **Clé primaire** : id (TEXT)
- **Relations** :
  - N-1 avec users (user_id)
  - N-1 avec menus (menu_id)
  - 1-N avec order_history

## Diagramme MCD

[Créer un diagramme avec draw.io, Mermaid, ou outils similaires]

## Schéma relationnel

[Représenter visuellement les tables et leurs relations]
```

**B. Utiliser un outil de modélisation**

- **Draw.io** (gratuit) : Créer un diagramme ER
- **dbdiagram.io** (gratuit) : Générer depuis le SQL
- **Mermaid** : Diagrammes dans Markdown

**C. Documenter les migrations**

Créer un système de migrations (même simple) :

```
server/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_indexes.sql
│   └── README.md
```

**Pourquoi ?**
- ✅ Communication claire de la structure
- ✅ Documentation pour maintenance
- ✅ Facilite les évolutions futures
- ✅ Démonstration de compétences en modélisation

**Action à justifier** :
> "J'ai documenté le modèle de données relationnel avec un diagramme entité-relation et une description détaillée des tables, relations et contraintes. Cette documentation facilite la compréhension de la structure de la base de données et guide les futures évolutions."

---

### 2.2 Développer des composants d'accès aux données

#### 📌 État actuel
- ✅ Helpers de base (query, queryOne, run)
- ✅ Transactions supportées
- ⚠️ Pas de couche DAO/Repository

#### 💡 Améliorations proposées

**A. Créer une couche Repository**

Créer `server/src/repositories/` :

```
server/src/repositories/
├── BaseRepository.js      # Classe de base avec CRUD générique
├── UserRepository.js
├── MenuRepository.js
├── OrderRepository.js
└── DishRepository.js
```

**Exemple `MenuRepository.js`** :

```javascript
// server/src/repositories/MenuRepository.js
import { query, queryOne, run, transaction } from '../db.js';

export class MenuRepository {
  // CREATE
  static create(menuData) {
    const id = menuData.id;
    const sql = `
      INSERT INTO menus (
        id, title, description, theme, regime,
        minimum_guests, base_price, price_per_additional_guest,
        stock, highlight, conditions_ordering, conditions_storage, conditions_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id, menuData.title, menuData.description,
      menuData.theme, menuData.regime,
      menuData.minimumGuests, menuData.basePrice,
      menuData.pricePerAdditionalGuest ?? null,
      menuData.stock ?? 0, menuData.highlight ?? null,
      menuData.conditions?.orderingNotice ?? '',
      menuData.conditions?.storage ?? '',
      menuData.conditions?.notes ?? null,
    ];
    
    run(sql, params);
    return this.findById(id);
  }
  
  // READ
  static findAll(filters = {}) {
    const { where, params } = this.buildWhereClause(filters);
    const sql = `
      SELECT * FROM menu_view ${where}
      ORDER BY created_at DESC
    `;
    return query(sql, params);
  }
  
  static findById(id) {
    const sql = 'SELECT * FROM menu_view WHERE id = ?';
    return queryOne(sql, [id]);
  }
  
  // UPDATE
  static updateStock(id, stock) {
    const sql = 'UPDATE menus SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    run(sql, [stock, id]);
    return this.findById(id);
  }
  
  // DELETE (si nécessaire)
  static delete(id) {
    const sql = 'DELETE FROM menus WHERE id = ?';
    run(sql, [id]);
  }
  
  // Helper pour construire les clauses WHERE
  static buildWhereClause(filters) {
    // Logique de filtrage...
  }
}
```

**B. Séparer la logique SQL de la logique métier**

Les services (`menuService.js`) utilisent les repositories, pas directement `db.js`.

**Pourquoi ?**
- ✅ Séparation des responsabilités
- ✅ Réutilisabilité
- ✅ Tests plus simples
- ✅ Maintenance facilitée

**Action à justifier** :
> "J'ai créé une couche Repository qui encapsule tous les accès à la base de données. Cette architecture sépare clairement la logique d'accès aux données de la logique métier, facilitant la maintenance et les tests unitaires."

---

### 2.3 Développer des composants métier côté serveur

#### 📌 État actuel
- ✅ API REST avec Express
- ✅ Validation avec Zod
- ✅ Authentification basique
- ⚠️ Gestion d'erreurs à améliorer
- ⚠️ Documentation API manquante

#### 💡 Améliorations proposées

**A. Améliorer la gestion d'erreurs**

Créer `server/src/middleware/errorHandler.js` :

```javascript
// server/src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Erreur de validation Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Données invalides',
      details: err.errors,
    });
  }
  
  // Erreur de base de données
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      message: 'Erreur de base de données',
    });
  }
  
  // Erreur par défaut
  res.status(err.status ?? 500).json({
    message: err.message ?? 'Erreur serveur',
  });
}
```

**B. Créer un système de logging**

```javascript
// server/src/utils/logger.js
export const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
};
```

**C. Documenter l'API avec OpenAPI/Swagger**

Installer `swagger-jsdoc` et `swagger-ui-express` :

```javascript
// server/src/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vite & Gourmand API',
      version: '1.0.0',
      description: 'API REST pour l\'application Vite & Gourmand',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Serveur de développement',
      },
    ],
  },
  apis: ['./src/**/*.js'], // Chemins vers les fichiers contenant les annotations
};

export const swaggerSpec = swaggerJsdoc(options);
```

**Exemple d'annotation dans `index.js`** :

```javascript
/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Liste les menus
 *     tags: [Menus]
 *     parameters:
 *       - in: query
 *         name: theme
 *         schema:
 *           type: string
 *         description: Filtre par thème
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *     responses:
 *       200:
 *         description: Liste des menus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Menu'
 */
app.get('/api/menus', (req, res) => {
  // ...
});
```

**D. Sécurité renforcée**

1. **Rate limiting** : Installer `express-rate-limit`

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par IP
});

app.use('/api/', limiter);
```

2. **Helmet** pour les en-têtes de sécurité

```javascript
import helmet from 'helmet';
app.use(helmet());
```

3. **Validation stricte des entrées** (déjà fait avec Zod, à maintenir)

**Pourquoi ?**
- ✅ Documentation interactive de l'API
- ✅ Meilleure gestion des erreurs
- ✅ Sécurité renforcée
- ✅ Débogage facilité

**Action à justifier** :
> "J'ai amélioré la gestion d'erreurs avec un middleware dédié, ajouté la documentation API avec Swagger pour faciliter l'intégration, et renforcé la sécurité avec rate limiting et Helmet. Ces améliorations garantissent la robustesse et la maintenabilité de l'API."

---

### 2.4 Documenter le déploiement

#### 📌 État actuel
- ✅ README de base
- ❌ Pas de documentation Docker
- ⚠️ Variables d'environnement non documentées

#### 💡 Améliorations proposées

**A. Créer un README complet avec Docker**

Mettre à jour le `README.md` principal avec :

```markdown
# Vite & Gourmand

## 🚀 Démarrage rapide avec Docker

### Prérequis
- Docker et Docker Compose installés
- Git

### Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd vite-gourmand-main
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env si nécessaire
   ```

3. **Lancer l'application**
   ```bash
   docker compose up --build
   ```

4. **Initialiser la base de données** (première fois uniquement)
   ```bash
   docker compose exec server npm run seed
   ```

5. **Accéder à l'application**
   - Frontend : http://localhost:5173
   - Backend API : http://localhost:4000
   - Documentation API : http://localhost:4000/api-docs (si Swagger configuré)

### Arrêter l'application
```bash
docker compose down
```

## 📋 Structure du projet

[Description détaillée...]

## 🔧 Variables d'environnement

### Frontend (`app/.env`)
- `VITE_API_URL` : URL de l'API backend (défaut: http://localhost:4000)

### Backend (`server/.env`)
- `PORT` : Port du serveur (défaut: 4000)
- `NODE_ENV` : Environnement (development/production)
- `DB_PATH` : Chemin vers la base de données (défaut: ./data/vite-gourmand.db)

## 🗄️ Base de données

La base de données SQLite est initialisée automatiquement au premier lancement.

Pour réinitialiser :
```bash
docker compose exec server npm run seed
```

## 📚 Documentation

- [Modèle de données](server/docs/MODELE_DONNEES.md)
- [Documentation API](http://localhost:4000/api-docs)
- [Wireframes](docs/wireframes/README.md)
```

**B. Créer `DEPLOIEMENT.md`**

Document détaillé pour la mise en production :

```markdown
# Guide de déploiement - Vite & Gourmand

## Environnement de production

### 1. Prérequis serveur
- Docker et Docker Compose
- Domaine configuré (optionnel)
- Certificat SSL (Let's Encrypt recommandé)

### 2. Configuration

1. Cloner le repository
2. Configurer `.env` pour la production
3. Construire et lancer :
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

### 3. Sauvegarde de la base de données

[Instructions pour sauvegarder SQLite...]

### 4. Monitoring

[Instructions pour le monitoring...]
```

**Pourquoi ?**
- ✅ Facilité de démarrage
- ✅ Répétabilité
- ✅ Documentation complète
- ✅ Conformité aux bonnes pratiques

**Action à justifier** :
> "J'ai créé une documentation complète du déploiement incluant les instructions Docker, la description des variables d'environnement et un guide de mise en production. Cette documentation permet à n'importe quel développeur de lancer le projet rapidement."

---

## 🐳 DOCKER (Obligatoire)

### Configuration complète

#### 1. Dockerfile Backend

Créer `server/Dockerfile` :

```dockerfile
# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le répertoire pour la base de données
RUN mkdir -p data

# Exposer le port
EXPOSE 4000

# Commande de démarrage
CMD ["node", "src/index.js"]
```

#### 2. docker-compose.yml (racine du projet)

```yaml
version: '3.8'

services:
  # Backend
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: vite-gourmand-server
    ports:
      - "4000:4000"
    volumes:
      - ./server/data:/app/data
      - ./server/src:/app/src
    environment:
      - NODE_ENV=development
      - PORT=4000
      - DB_PATH=./data/vite-gourmand.db
    networks:
      - vite-gourmand-network
    restart: unless-stopped

  # Frontend
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: vite-gourmand-app
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://server:4000
    depends_on:
      - server
    networks:
      - vite-gourmand-network
    restart: unless-stopped

networks:
  vite-gourmand-network:
    driver: bridge
```

#### 3. .dockerignore (pour chaque service)

**server/.dockerignore** :
```
node_modules
data/*.db
data/*.db-shm
data/*.db-wal
.env
*.log
.git
```

**app/.dockerignore** :
```
node_modules
dist
.env
.env.local
*.log
.git
```

#### 4. Variables d'environnement

Créer `.env.example` à la racine :

```env
# Backend
NODE_ENV=development
PORT=4000
DB_PATH=./data/vite-gourmand.db

# Frontend
VITE_API_URL=http://localhost:4000
```

**Pourquoi ?**
- ✅ Environnement isolé et reproductible
- ✅ Facilité de déploiement
- ✅ Gestion des dépendances simplifiée
- ✅ Conformité aux exigences de formation

**Action à justifier** :
> "J'ai containerisé l'application complète avec Docker, incluant le frontend, le backend et la configuration réseau. L'utilisation de docker-compose permet de lancer l'ensemble de l'application avec une seule commande, garantissant un environnement de développement identique pour tous."

---

## 📝 PLAN D'ACTION PRIORITAIRE

### Phase 1 - Fondations (Priorité HAUTE)
1. ✅ Créer les Dockerfiles (frontend + backend)
2. ✅ Créer docker-compose.yml
3. ✅ Configurer les variables d'environnement
4. ✅ Tester le lancement avec Docker

### Phase 2 - Documentation (Priorité HAUTE)
5. ✅ Créer les wireframes
6. ✅ Documenter le modèle de données
7. ✅ Mettre à jour le README avec Docker
8. ✅ Créer DEPLOIEMENT.md

### Phase 3 - Architecture (Priorité MOYENNE)
9. ⚠️ Réorganiser la structure du projet (frontend)
10. ⚠️ Créer la couche Repository (backend)
11. ⚠️ Créer le service API centralisé (frontend)

### Phase 4 - Qualité (Priorité MOYENNE)
12. ⚠️ Améliorer l'accessibilité
13. ⚠️ Renforcer la sécurité (rate limiting, Helmet)
14. ⚠️ Documenter l'API (Swagger)

### Phase 5 - Améliorations UX (Priorité BASSE)
15. ⚠️ Améliorer les feedbacks utilisateur
16. ⚠️ Optimiser le CSS responsive
17. ⚠️ Ajouter des tests (optionnel mais recommandé)

---

## 🎓 JUSTIFICATIONS PÉDAGOGIQUES

### Pour chaque amélioration, vous devez pouvoir expliquer :

1. **Pourquoi cette amélioration ?**
   - Référence aux bonnes pratiques
   - Bénéfices concrets

2. **Comment elle respecte le référentiel ?**
   - Lien avec les compétences visées
   - Conformité aux standards

3. **Quels outils/technologies utilisés ?**
   - Justification du choix
   - Alternatives considérées

4. **Impact sur le projet ?**
   - Maintenabilité
   - Performance
   - Expérience utilisateur

---

## 📚 RESSOURCES UTILES

- [Documentation Docker](https://docs.docker.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Best Practices](https://react.dev/learn)

---

**Ce document sert de guide pour améliorer progressivement votre projet et justifier vos choix techniques devant un jury.**

