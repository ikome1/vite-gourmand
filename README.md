# Vite & Gourmand - Application de Traiteur Événementiel

Application web complète pour la gestion d'un service de traiteur événementiel.

## 🚀 Démarrage Rapide avec Docker (Recommandé)

### Prérequis
- Docker et Docker Compose installés

### Lancer le projet

```bash
# 1. Lancer tous les services
docker compose up --build

# 2. Attendre que les services démarrent (30 secondes environ)

# 3. Accéder à l'application
# Frontend: http://localhost:5173
# Backend: http://localhost:4000
```

La base de données est automatiquement initialisée au premier démarrage.

### Arrêter le projet

```bash
docker compose down
```

## 📋 Comptes de démonstration

- **Administrateur** :
  - Email : `julie@vite-gourmand.fr`
  - Mot de passe : `Admin2025!`

- **Employé** :
  - Email : `jose@vite-gourmand.fr`
  - Mot de passe : `Employe2025!`

## 🛠️ Démarrage sans Docker

### Backend

```bash
cd server
npm install
npm run seed  # Initialiser la base de données
npm run dev   # Démarrer sur http://localhost:4000
```

### Frontend

```bash
cd app
npm install
npm run dev   # Démarrer sur http://localhost:5173
```

## 📚 Documentation

- [Guide Docker complet](README_DOCKER.md)
- [Fonctionnement du projet](fonctionnement.md)

## 🏗️ Structure

```
vite-gourmand/
├── app/          # Frontend React + Vite + TypeScript
├── server/       # Backend Express + SQLite
└── docker-compose.yml
```

## ✅ Fonctionnalités

- ✅ Affichage des menus avec filtres
- ✅ Système d'authentification (utilisateur, employé, administrateur)
- ✅ Gestion des commandes
- ✅ Espace professionnel
- ✅ Page de contact
- ✅ Témoignages clients
