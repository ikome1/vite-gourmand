# Fonctionnement de l’application Vite & Gourmand

Ce document décrit comment l’interface web (front-end) et l’API (back-end) collaborent, ainsi que les étapes clés du parcours utilisateur.

## Vue d’ensemble technique

```
Navigateur (React/Vite) ── http/JSON ──> API Express (Node) ──> Base SQLite
             ▲                                            │
             └─────── Contextes Auth & Menus ─────────────┘
```

1. Le front-end React est généré par Vite. Il communique avec l’API via des requêtes `fetch` sur `VITE_API_URL` (par défaut `http://localhost:4000`).
2. L’API Express applique les règles de sécurité (authentification, rôles), exécute les validations, puis interagit avec la base SQLite grâce à `better-sqlite3`.
3. Les données (menus, utilisateurs, commandes, témoignages…) sont stockées dans `server/data/vite-gourmand.db`, initialisées via `npm run seed`.

## Fonctionnement front-end

### 1. Contexts et hooks

- `AuthContext` :
  - Stocke l’utilisateur courant, le jeton d’authentification et l’état d’initialisation.
  - Fournit `register`, `login`, `logout`, `resetPassword`.
  - À la connexion, le jeton est conservé dans `localStorage` (`vite-gourmand:auth-token`). A chaque chargement, un `GET /api/auth/me` vérifie la session.

- `MenuContext` :
  - Gère les menus, filtres (thème, régime, prix, recherche), état de chargement/erreur.
  - Les filtres déclenchent un `GET /api/menus` avec query string (ex. `?theme=Noël&maxPrice=500`).
  - Fournit `createMenu` et `updateMenuStock` pour l’espace pro (nécessite un jeton valide).

### 2. Pages clés

- `HomePage` : sections marketing, présentation, expertise, avis (via `GET /api/testimonials`).
- `MenusPage` : liste filtrable, cartes de menu (`MenuCard`). Affiche l’état de chargement, d’erreur ou de vide.
- `MenuDetailPage` : télécharge un menu (`GET /api/menus/:id`) avec cours (entrées/plats/desserts).
- `OrderPage` : si non authentifié → redirection vers connexion ; sinon soumet un `POST /api/orders`.
- `ProSpacePage` : réservé aux rôles `employe`/`administrateur`. Permet de changer le stock (`PATCH /api/menus/:id/stock`) et d’ajouter un menu (`POST /api/menus`).
- `LoginPage` / `RegisterPage` / `ForgotPasswordPage` : formulaires reliés aux endpoints d’authentification.

### 3. Gestion des états

- Les composants affichent des retours utilisateur (succès/erreurs) en français et adaptent l’UI selon l’état (loading, erreur, liste vide).
- Les commandes et créations de menu affichent un message de confirmation depuis la réponse serveur.

## Fonctionnement back-end

### 1. Structure principale (`server/src`)

- `index.js` : point d’entrée Express, définition des routes REST, middleware CORS, JSON, authentification.
- `auth.js` : gestion des sessions en mémoire (`Map`), hashage SHA-256, fonctions `loginUser`, `registerUser`, `serializeUser`.
- `menuService.js`, `orderService.js` : logique métier (listage, détail, création menu, commandes).
- `db.js` : initialisation SQLite, helpers `query`, `queryOne`, `run`, transactions.
- `seed.js` / `seedData.js` : génération des données de démonstration.
- `schema.sql` : définition du schéma relationnel (tables menus, plats, allergènes, commandes, etc.).

### 2. Sécurité & rôles

- Authentification via jeton aléatoire (stocké en mémoire). Un header `Authorization: Bearer <token>` est requis pour les routes protégées.
- Rôles :
  - `utilisateur` : navigation, commandes, historique, modification profil (via endpoints génériques).
  - `employe`, `administrateur` : accès aux routes de gestion (`POST /api/menus`, `PATCH /api/menus/:id/stock`).
- Les mots de passe ne sont jamais renvoyés ; seuls les champs publics (`serializeUser`) sont exposés.

### 3. Validation

- Zod valide les payloads (ex. mots de passe, menus, commandes) pour prévenir toute injection.
- Toutes les réponses utilisent des messages en français cohérents avec l’interface.

## Scénario d’utilisation

1. **Visiteur** ouvre l’application : `MenuContext` interroge `GET /api/menus`. Affiche les menus disponibles.
2. Il **filtre** (ex. thème « Brunch », maximum 400 €) : déclenche un nouvel appel API avec query string.
3. Il **consulte un menu** : `MenuDetailPage` récupère le détail complet via `GET /api/menus/:id`.
4. Il souhaite **commander** : redirigé vers l’inscription ou la connexion si nécessaire.
5. Après **connexion**, il remplit le formulaire de commande ; `POST /api/orders` crée l’ordre et décrémente le stock.
6. Julie/José (role `employe`) accèdent à l’**espace pro** : `GET /api/menus` puis ajustent le stock ou ajoutent un menu via les endpoints dédiés.

## Points d’extension

- Remplacer les sessions mémoire par des tokens JWT (ou un store Redis) pour la scalabilité.
- Ajouter une gestion complète des plats dans l’espace pro (CRUD avec choix des allergènes).
- Brancher un service d’e-mails (SendGrid, Mailjet) pour les notifications réelles.
- Implémenter une recherche temps réel (ex. WebSocket) ou un mode offline (PWA).

## Résumé

- Front-end : React + TypeScript, contexts `Auth`/`Menu`, communication REST, design responsive.
- Back-end : Express + SQLite, validations Zod, gestion rôles, seed complet.
- Les deux couches échangent en JSON, les messages et écrans sont entièrement francisés, et le projet respecte les contraintes fonctionnelles et réglementaires fixées par le cahier des charges FastDev.

