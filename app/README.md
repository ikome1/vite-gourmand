# Vite & Gourmand — Application Web

Plateforme web réalisée avec React, TypeScript et Vite pour présenter les menus de l’entreprise de traiteur Vite & Gourmand (Julie & José) et permettre aux visiteurs d’initier une commande en ligne.

## Fonctionnalités principales

- Page d’accueil avec présentation de l’entreprise, mise en avant du professionnalisme et avis clients vérifiés (issus de la base de données).
- Catalogue des menus avec fiches détaillées, filtres dynamiques (prix, thème, régime, nombre de convives, recherche plein texte) et intégration avec l’API.
- Page détail menu affichant composition, allergènes, conditions et bouton de commande (redirection vers le formulaire sécurisé).
- Authentification (inscription, connexion, mot de passe oublié) avec rôles : `utilisateur`, `employe`, `administrateur`.
- Commande en ligne pré-remplie pour les utilisateurs connectés (enregistrement côté serveur et décrément du stock).
- Espace pro (employé/admin) permettant de consulter les stocks et d’ajouter rapidement un menu via l’API.
- Pages Contact, Mentions légales, CGV et pied de page complet (horaires, liens réglementaires).

## Architecture

```
Vite & Gourmand /
├── app/       # Front-end React + Vite
└── server/    # Back-end Express + SQLite (better-sqlite3)
```

Le front consomme l’API via l’URL définie dans la variable d’environnement `VITE_API_URL` (par défaut `http://localhost:4000`).

## Prérequis

- Node.js ≥ 20.19 (requis par Vite 7) pour le front-end.
- Node.js ≥ 18 pour le serveur Express (recommandé : même version que ci-dessus).
- npm ou tout autre gestionnaire compatible (utiliser alors les commandes équivalentes).

## Installation

### 1. Back-end (Express + SQLite)

```bash
cd "Vite & Gourmand/server"
npm install
npm run seed   # initialise la base SQLite avec menus, utilisateurs, témoignages
npm run dev    # lance l’API sur http://localhost:4000
```

Endpoints principaux :

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/menus` | Liste paginable/filtrable des menus |
| `GET` | `/api/menus/:id` | Détail complet d’un menu (plats, allergènes, conditions) |
| `POST` | `/api/menus` *(roles employe/admin)* | Création d’un nouveau menu |
| `PATCH` | `/api/menus/:id/stock` *(roles employe/admin)* | Mise à jour du stock |
| `POST` | `/api/orders` *(auth requis)* | Enregistrement d’une commande client |
| `GET` | `/api/orders` *(auth requis)* | Historique des commandes d’un utilisateur |
| `POST` | `/api/auth/register` | Inscription avec validation RGPD |
| `POST` | `/api/auth/login` | Connexion avec génération de jeton en mémoire |
| `POST` | `/api/auth/logout` | Invalidation du jeton |
| `GET` | `/api/auth/me` | Récupération du profil courant |
| `POST` | `/api/auth/reset-password` | Simulation d’envoi de lien de réinitialisation |
| `GET` | `/api/testimonials` | Avis clients validés |

**Comptes de démonstration** (seeds) :

- Administrateur — `julie@vite-gourmand.fr` / `Admin2025!`
- Employé — `jose@vite-gourmand.fr` / `Employe2025!`

### 2. Front-end (Vite + React)

```bash
cd "Vite & Gourmand/app"
npm install
cp .env.example .env            # personnaliser l’URL de l’API si nécessaire
npm run dev                     # http://localhost:5173
```

Scripts utiles :

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile l’application (dossier `dist/`) |
| `npm run preview` | Prévisualise la version buildée |

## Base de données

- **SQLite** (fichier `server/data/vite-gourmand.db`).
- Tables principales : `users`, `menus`, `menu_images`, `dishes`, `dish_allergens`, `orders`, `testimonials`.
- Contraintes : clés étrangères actives, gestion des allergènes, historisation des statuts de commande.
- Script de création/seed : `server/src/schema.sql` & `server/src/seed.js`.

## Flux applicatif

1. Les utilisateurs non connectés consultent les menus via `GET /api/menus` (filtres appliqués côté serveur).
2. Une fois connectés, ils peuvent commander (`POST /api/orders`) : le serveur vérifie le stock et décrémente automatiquement.
3. Les collaborateurs disposant d’un rôle `employe` ou `administrateur` peuvent ajuster les stocks et ajouter de nouveaux menus via l’espace pro (routes protégées par jeton).
4. Les avis affichés côté front proviennent de la base (`GET /api/testimonials`) et sont filtrés sur `validated = 1`.

## Notes RGPD & sécurité

- Les formulaires mentionnent explicitement la finalité des données et exigent le consentement (contact, inscription).
- Les mots de passe sont stockés en SHA-256 dans la base (démo) et jamais renvoyés côté client.
- Chaque session émet un jeton stocké en mémoire dans le serveur (à remplacer par un store persistant/JWT pour la production).
- Les avis clients affichés sont validés en amont conformément aux obligations françaises.

## Limitations connues

- Le moteur d’e-mails (bienvenue / reset mot de passe) est simulé côté API.
- Les menus créés via l’espace pro n’intègrent pas encore la saisie détaillée des plats/allergènes (à enrichir selon le besoin métier).
- Les sessions sont conservées en mémoire ; prévoir un stockage distribué pour un déploiement multi-instance.

## Licence

Projet réalisé dans un cadre pédagogique pour FastDev. Toute réutilisation commerciale nécessite l’accord préalable de Vite & Gourmand.
