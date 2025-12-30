# Dockerfile pour le backend Express
FROM node:20-alpine

WORKDIR /app

# Installer les dépendances système pour better-sqlite3 et wget pour healthcheck
RUN apk add --no-cache python3 make g++ sqlite wget

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Créer le dossier data s'il n'existe pas
RUN mkdir -p data

# Copier le script d'initialisation
COPY init.sh /app/init.sh
RUN chmod +x /app/init.sh

# Exposer le port Express
EXPOSE 4000

# Commande par défaut (peut être surchargée par docker-compose)
CMD ["/app/init.sh"]

