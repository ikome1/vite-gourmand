#!/bin/sh

echo "🔄 Initialisation de la base de données..."
npm run seed

echo "✅ Base de données initialisée"
echo "🚀 Démarrage du serveur..."

npm run dev

