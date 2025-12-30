# 🚀 Démarrage Rapide - Vite & Gourmand

## Pour votre professeur

### Étape 1 : Installer Docker

Si Docker n'est pas installé :
- **Mac** : [Docker Desktop pour Mac](https://www.docker.com/products/docker-desktop)
- **Windows** : [Docker Desktop pour Windows](https://www.docker.com/products/docker-desktop)
- **Linux** : `sudo apt install docker.io docker-compose`

### Étape 2 : Cloner le projet

```bash
git clone https://github.com/ikome1/vite-gourmand.git
cd vite-gourmand
git checkout dev
```

### Étape 3 : Lancer le projet

```bash
docker compose up --build
```

**C'est tout !** 🎉

Attendez 30-60 secondes que les services démarrent, puis :

- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:4000

### Étape 4 : Se connecter

- **Email** : `julie@vite-gourmand.fr`
- **Mot de passe** : `Admin2025!`

## 📝 Commandes utiles

```bash
# Arrêter le projet
docker compose down

# Voir les logs
docker compose logs -f

# Redémarrer
docker compose restart
```

## ⚠️ En cas de problème

Si les ports 4000 ou 5173 sont déjà utilisés, modifiez `docker-compose.yml` :

```yaml
ports:
  - "4001:4000"  # Changez le premier nombre
  - "5174:5173"  # Changez le premier nombre
```

Puis redémarrez : `docker compose up --build`

