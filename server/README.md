# API Vite & Gourmand

Ce dossier contient l’API REST utilisée par l’application front-end Vite & Gourmand. Elle est développée en **Node.js / Express** et stocke ses données dans une base **SQLite**.

## Prérequis

- Node.js ≥ 18 (recommandé : la même version que pour le front, ≥ 20.19).
- npm (ou équivalent). Aucune installation de serveur SQL externe n’est nécessaire : le fichier SQLite est créé automatiquement à l’initialisation.

## Installation

```bash
cd server
npm install
```

## Commandes utiles

| Commande         | Description |
|------------------|-------------|
| `npm run dev`    | Lance le serveur en mode développement (reload avec nodemon) |
| `npm start`      | Démarre l’API en mode production |
| `npm run seed`   | Réinitialise la base SQLite et injecte les données de démonstration |

Le serveur écoute par défaut sur `http://localhost:4000`. La variable `ALLOWED_ORIGINS` (séparée par des virgules) permet d’autoriser d’autres domaines pour CORS.

## Endpoints principaux

| Méthode | URL | Rôle |
|---------|-----|------|
| `GET` | `/health` | Test de disponibilité |
| `GET` | `/api/menus` | Liste des menus avec filtres (thème, régime, prix, recherche…) |
| `GET` | `/api/menus/:id` | Détail complet d’un menu (plats, allergènes, conditions) |
| `POST` | `/api/menus` *(roles employe/admin)* | Création d’un menu |
| `PATCH` | `/api/menus/:id/stock` *(roles employe/admin)* | Mise à jour du stock |
| `GET` | `/api/testimonials` | Avis clients validés |
| `POST` | `/api/auth/register` | Inscription d’un utilisateur (rôle par défaut : `utilisateur`) |
| `POST` | `/api/auth/login` | Connexion et génération de jeton de session |
| `POST` | `/api/auth/logout` | Déconnexion (invalidation du jeton) |
| `GET` | `/api/auth/me` | Récupération du profil courant |
| `POST` | `/api/auth/reset-password` | Simulation de réinitialisation de mot de passe |
| `POST` | `/api/orders` *(auth requis)* | Enregistrement d’une commande client |
| `GET` | `/api/orders` *(auth requis)* | Historique des commandes du client |

Les réponses et messages d’erreur sont en français pour cohérence avec le front.

## Base de données

- Le fichier SQLite est créé dans `server/data/vite-gourmand.db` (mode WAL activé).
- Le schéma est défini dans `src/schema.sql` et couvre : `users`, `menus`, `menu_images`, `dishes`, `menu_dishes`, `allergens`, `dish_allergens`, `testimonials`, `orders`, `order_history`.
- Le script `npm run seed` vide les tables puis injecte :
  - deux comptes (`administrateur`, `employe`) et la logique de hashage SHA-256
  - menus de démonstration + plats + associations allergènes
  - témoignages validés

## Sessions & sécurité

- À la connexion, un jeton aléatoire est généré et conservé en mémoire (`Map`). Pour un déploiement multi-instance, remplacer par un stockage partagé (Redis, base) ou des JWT.
- Les routes protégées vérifient la présence du header `Authorization: Bearer <token>` et le rôle de l’utilisateur.
- Les mots de passe sont hachés côté serveur et ne transitent jamais en clair après l’inscription.

## Configuration du front

Dans le dossier `app/`, configurez l’URL de cette API dans `.env` :

```
VITE_API_URL=http://localhost:4000
```

Le front consommera automatiquement la liste des menus, les détails, les commandes et l’authentification via ces endpoints.
