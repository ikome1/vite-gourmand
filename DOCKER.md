# 🐳 Guide Docker - Vite & Gourmand

## Démarrage rapide

### Prérequis
- Docker Desktop installé (ou Docker + Docker Compose)
- Git

### Commandes essentielles

#### 1. Lancer l'application complète
```bash
docker compose up --build
```

Cette commande :
- Construit les images Docker pour le frontend et le backend
- Lance les deux conteneurs
- Configure le réseau interne
- Monte les volumes nécessaires

#### 2. Lancer en arrière-plan
```bash
docker compose up -d
```

#### 3. Initialiser la base de données (première fois uniquement)
```bash
docker compose exec server npm run seed
```

#### 4. Voir les logs
```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f server
docker compose logs -f app
```

#### 5. Arrêter l'application
```bash
docker compose down
```

#### 6. Arrêter et supprimer les volumes (⚠️ supprime la base de données)
```bash
docker compose down -v
```

#### 7. Rebuild complet (en cas de modifications importantes)
```bash
docker compose down
docker compose build --no-cache
docker compose up
```

## Accès aux services

Une fois lancé :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:4000
- **Healthcheck API** : http://localhost:4000/health

## Structure des fichiers Docker

```
.
├── docker-compose.yml      # Configuration des services
├── server/
│   ├── Dockerfile          # Image du backend
│   └── .dockerignore       # Fichiers exclus du build
└── app/
    ├── Dockerfile          # Image du frontend
    └── .dockerignore       # Fichiers exclus du build
```

## Variables d'environnement

Les variables peuvent être définies dans :
1. Le fichier `.env` à la racine (à créer depuis `.env.example`)
2. Directement dans `docker-compose.yml` (section `environment`)

## Dépannage

### Le conteneur ne démarre pas
```bash
# Vérifier les logs
docker compose logs server
docker compose logs app

# Vérifier que les ports ne sont pas déjà utilisés
lsof -i :4000
lsof -i :5173
```

### Modifier le code et voir les changements

**Backend** : Le code source est monté en volume, les modifications sont prises en compte si vous utilisez `nodemon` ou si vous redémarrez :
```bash
docker compose restart server
```

**Frontend** : Pour le développement, vous pouvez :
- Utiliser `npm run dev` en local (sans Docker)
- Ou modifier le Dockerfile pour utiliser Vite en mode dev avec hot reload

### Réinitialiser la base de données
```bash
# Arrêter les conteneurs
docker compose down

# Supprimer le fichier de base de données
rm server/data/vite-gourmand.db*

# Relancer et réinitialiser
docker compose up -d
docker compose exec server npm run seed
```

## Mode développement vs production

Le `docker-compose.yml` actuel est configuré pour le développement.

Pour la production, vous devriez :
- Créer un `docker-compose.prod.yml`
- Utiliser des variables d'environnement sécurisées
- Configurer un reverse proxy (nginx/traefik)
- Utiliser une base de données externe (PostgreSQL par exemple)

## Commandes utiles

```bash
# Entrer dans un conteneur
docker compose exec server sh
docker compose exec app sh

# Exécuter une commande dans un conteneur
docker compose exec server npm run seed
docker compose exec server node -v

# Voir l'état des conteneurs
docker compose ps

# Voir l'utilisation des ressources
docker stats
```

