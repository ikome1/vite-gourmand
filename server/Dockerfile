# Stage 1: Build et développement
FROM node:20-alpine AS base

WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Créer le répertoire pour la base de données
RUN mkdir -p data

# Exposer le port
EXPOSE 4000

# Commande par défaut (peut être overridé par docker-compose)
CMD ["npm", "run", "dev"]

