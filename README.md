# Projet « Vite & Gourmand »

Ce dépôt contient l’application complète développée pour Julie & José (traiteur Vite & Gourmand) dans le cadre de la mission FastDev. Il rassemble :

- **`app/`** : front-end React + TypeScript + Vite, interface publique et espace pro.
- **`server/`** : back-end Express + SQLite offrant l’API REST consommée par le front.

## Démarrage rapide

1. **Installer et lancer le serveur** :
   ```bash
   cd server
   npm install
   npm run seed   # initialise la base SQLite avec menus, comptes, avis
   npm run dev    # http://localhost:4000
   ```

2. **Installer et lancer le front** :
   ```bash
   cd ../app
   npm install
   cp .env.example .env   # vérifier l’URL de l’API, par défaut http://localhost:4000
   npm run dev             # http://localhost:5173
   ```

Les deux README détaillés sont disponibles ici :

- [Documentation front-end](app/README.md)
- [Documentation API](server/README.md)

## Comptes de démonstration

- Administrateur : `julie@vite-gourmand.fr` / `Admin2025!`
- Employé : `jose@vite-gourmand.fr` / `Employe2025!`

## Arborescence

```
Vite & Gourmand /
├── app/           # Interface web (React + Vite)
├── server/        # API Express + SQLite
├── presentation.md  # Présentation générale du projet
├── fonctionnement.md # Explications front/back détaillées
└── README.md      # ce document
```

## Conformité

- Toutes les chaînes visibles (front & back) sont en français.
- Mentions légales, CGV, RGPD et avis vérifiés sont intégrés conformément au cahier des charges.
- La documentation complète est disponible dans `presentation.md`, `fonctionnement.md`, `installer.md`, `app/README.md` et `server/README.md`.

Pour aller plus loin, se référer aux fichiers README de chaque sous-projet.
