# 🐳 Guide Docker - Vite & Gourmand

Ce guide explique comment lancer le projet avec Docker.

## 📋 Prérequis

- Docker installé ([Télécharger Docker](https://www.docker.com/get-started))
- Docker Compose installé (inclus avec Docker Desktop)

## 🚀 Démarrage rapide

### 1. Lancer le projet

```bash
# Depuis la racine du projet
docker compose up --build
```

Cette commande va :
- Construire les images Docker pour le frontend et le backend
- Démarrer les deux conteneurs
- Initialiser la base de données

### 2. Accéder à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:4000

### 3. Initialiser la base de données (première fois)

Dans un nouveau terminal :

```bash
# Exécuter le script de seed dans le conteneur
docker compose exec server npm run seed
```

## 📝 Commandes utiles

### Arrêter les conteneurs
```bash
docker compose down
```

### Voir les logs
```bash
# Tous les services
docker compose logs -f

# Seulement le backend
docker compose logs -f server

# Seulement le frontend
docker compose logs -f app
```

### Redémarrer les services
```bash
docker compose restart
```

### Reconstruire les images
```bash
docker compose up --build
```

### Accéder au shell du conteneur
```bash
# Backend
docker compose exec server sh

# Frontend
docker compose exec app sh
```

## 🔐 Comptes de démonstration

Après avoir exécuté `npm run seed` :

- **Administrateur** :
  - Email : `julie@vite-gourmand.fr`
  - Mot de passe : `Admin2025!`

- **Employé** :
  - Email : `jose@vite-gourmand.fr`
  - Mot de passe : `Employe2025!`

## 🛠️ Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier les logs
docker compose logs server

# Redémarrer
docker compose restart server
```

### La base de données n'est pas initialisée
```bash
# Réinitialiser la base de données
docker compose exec server npm run seed
```

### Port déjà utilisé
Si les ports 4000 ou 5173 sont déjà utilisés, modifiez `docker-compose.yml` :
```yaml
ports:
  - "4001:4000"  # Changer le port externe
```

## 📦 Structure Docker

- `app/Dockerfile` : Image pour le frontend React + Vite
- `server/Dockerfile` : Image pour le backend Express
- `docker-compose.yml` : Configuration pour orchestrer les services

## ✅ Vérification

Pour vérifier que tout fonctionne :

```bash
# Vérifier que les conteneurs sont actifs
docker compose ps

# Tester le backend
curl http://localhost:4000/health

# Tester le frontend
curl http://localhost:5173
```

