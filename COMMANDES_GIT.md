# ⚡ Commandes Git à Exécuter

## 📝 Étape 1 : Configurer Git (UNE SEULE FOIS)

Exécutez ces commandes pour configurer votre identité Git :

```bash
# Configurer votre nom et email (remplacez par vos informations)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# OU seulement pour ce projet (sans --global)
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"
```

## 🚀 Étape 2 : Finaliser l'initialisation

Une fois Git configuré, exécutez :

```bash
cd /Users/idrissakome/Downloads/vite-gourmand-main

# Vérifier que vous êtes sur dev
git branch

# Si vous n'êtes pas sur dev, passer sur dev
git checkout dev

# Ajouter tous les fichiers (si pas déjà fait)
git add .

# Créer le commit initial
git commit -m "chore: initial commit - projet Vite & Gourmand complet"

# Vous êtes maintenant prêt !
```

## 🔗 Étape 3 : Connecter à GitHub (optionnel)

Si vous avez un dépôt GitHub :

```bash
# Ajouter le remote (remplacez par votre URL GitHub)
git remote add origin https://github.com/votre-username/vite-gourmand.git

# Pousser main
git checkout main
git push -u origin main

# Pousser dev
git checkout dev
git push -u origin dev

# Définir dev comme branche par défaut sur GitHub
# (via l'interface web : Settings > Branches > Default branch)
```

## ✅ Vérification

```bash
# Voir les branches
git branch

# Voir l'historique
git log --oneline --all --graph

# Statut actuel
git status
```

## 📋 Workflow normal (après setup)

```bash
# 1. Créer une nouvelle fonctionnalité depuis dev
git checkout dev
git pull origin dev  # Si vous travaillez en équipe
git checkout -b feature/nom-fonctionnalite

# 2. Développer et commiter
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin feature/nom-fonctionnalite

# 3. Après validation, merger dans dev
git checkout dev
git merge feature/nom-fonctionnalite
git push origin dev
```

