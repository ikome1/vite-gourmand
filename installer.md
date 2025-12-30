# Guide d’installation et de déploiement

Ce document explique comment installer, configurer et lancer l’application **Vite & Gourmand** en local ou sur un serveur distant. Toutes les étapes sont valables pour un poste de développement ou un hébergement web classique (type VPS).

---

## 1. Pré-requis

| Outil | Version recommandée | Rôle |
|-------|---------------------|------|
| Node.js | ≥ 20.19 (obligatoire pour le build front) | Runtime JavaScript |
| npm | ≥ 9 | Gestionnaire de paquets |
| SQLite | Aucun binaire nécessaire (géré via `better-sqlite3`) | Base intégrée |

> **Note** : le serveur (`server/`) fonctionne à partir de Node 18, mais pour compiler le front sans avertissement, Node ≥ 20.19 est conseillé.  
> Vérifier votre version : `node -v`

---

## 2. Cloner le projet

```bash
git clone https://votre-repo.git
cd "Vite & Gourmand"
```

La structure attendue :

```
Vite & Gourmand /
├── app/
├── server/
├── presentation.md
├── fonctionnement.md
└── README.md
```

---

## 3. Installation du back-end (API Express)

```bash
cd server
npm install
```

### Configuration (optionnelle)

- `ALLOWED_ORIGINS` : définir les domaines autorisés par CORS (par défaut `http://localhost:5173`).
- `PORT` : port HTTP (par défaut `4000`).

On peut créer un fichier `.env` (non obligatoire) pour centraliser :

```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
```

### Initialisation de la base

```bash
npm run seed
```

Cette commande crée/alimente `server/data/vite-gourmand.db` avec :

- Comptes :
  - **Administrateur** : `julie@vite-gourmand.fr` / `Admin2025!`
  - **Employé** : `jose@vite-gourmand.fr` / `Employe2025!`
- Menus, plats, allergènes, témoignages de démonstration.

### Lancement de l’API

```bash
npm run dev    # mode développement (nodemon)
# ou
npm start      # mode production
```

L’API est accessible sur `http://localhost:4000` (ou le port défini).

---

## 4. Installation du front-end (React + Vite)

```bash
cd ../app
npm install
```

### Configuration

Copier le fichier d’exemple :

```bash
cp .env.example .env
```

Éditer `.env` pour indiquer l’URL de l’API (adaptée à votre environnement).

```env
VITE_API_URL=http://localhost:4000
```

### Lancement en développement

```bash
npm run dev
```

Le site est servi sur `http://localhost:5173`.  
Vérifiez que l’API tourne avant d’accéder au front, sinon les menus ne se chargeront pas.

### Build de production

```bash
npm run build
npm run preview  # pour tester le bundle
```

Le résultat est généré dans `app/dist/`.

---

## 5. Déploiement sur un serveur (VPS, conteneur, etc.)

### Étapes typiques

1. **Installer Node.js ≥ 20** sur le serveur.
2. **Cloner** le dépôt ou transférer les sources (`scp`, `rsync`, `git pull`).
3. **Installer les dépendances** :
   ```bash
   cd server && npm install && npm run seed
   cd ../app && npm install && npm run build
   ```
4. **Servir l’API** en arrière-plan (PM2, systemd, Docker) :
   - Exemple PM2 :
     ```bash
     cd server
     pm2 start src/index.js --name vite-gourmand-api --env production
     ```
5. **Servir le front** :
   - Option 1 : Serveur statique (Nginx, Apache) pointant vers `app/dist`.
   - Option 2 : `npm run preview` derrière un reverse proxy (moins recommandé en prod).

### Configuration Nginx (exemple)

```
server {
    listen 80;
    server_name votre-domaine.fr;

    root /chemin/Vite & Gourmand/app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Important** : assurer que le port `4000` (API) n’est pas bloqué ou qu’il est bien proxifié.

---

## 6. Ports utilisés

- **4000** : API Express (AJAX, JSON). Configurable via `PORT`.
- **5173** : Serveur Vite (dev). Configurable via `npm run dev -- --port 5173`.

En production, seuls les ports exposés par votre reverse proxy/importants doivent être ouverts (ex. 80/443).

---

## 7. Résumé des comptes de démo

| Rôle | E-mail | Mot de passe | Droits |
|------|--------|--------------|--------|
| Administrateur | `julie@vite-gourmand.fr` | `Admin2025!` | Accès complet, création menus, gestion stocks |
| Employé | `jose@vite-gourmand.fr` | `Employe2025!` | Accès espace pro (stock & ajout menus) |
| Utilisateur (après inscription) | Adresse fournie | Mot de passe choisi (10 caractères min + màj/min/chiffre/spécial) | Consultation & commande |

> Pour créer d’autres comptes utilisa teurs, utilisez le formulaire d’inscription côté front (`/inscription`).  
> Pour ajouter des employés/administrateurs supplémentaires, modifier manuellement la base (table `users`) ou étendre l’API d’administration.

---

## 8. Bonnes pratiques

- Mettre à jour Node.js et npm régulièrement.
- Sauvegarder le fichier `server/data/vite-gourmand.db` avant les mises à jour.
- Utiliser HTTPS sur le serveur (Let’s Encrypt).
- En production, remplacer la gestion de session en mémoire par un mécanisme persistant (Redis, JWT).
- Activer un monitoring pour l’API (PM2, journaux systemd, etc.).

---

## 9. Vérifications post-installation

1. Accéder à `http://localhost:5173` (ou votre domaine).
2. Vérifier le chargement des menus (aucun message d’erreur).
3. Tester la connexion avec les identifiants admin/employé.
4. Passer une commande test (stock décrémenté).
5. Vérifier l’espace pro (mise à jour du stock, ajout de menu).

Si tout est ok, l’application est prête à être utilisée en production par Julie & José ! 🚀

