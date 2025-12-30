# 🚀 Setup Git - Guide Complet

## 📋 Étapes pour initialiser Git avec la structure de branches

### 1. Initialiser le dépôt Git

```bash
cd /Users/idrissakome/Downloads/vite-gourmand-main

# Initialiser Git
git init

# Vérifier que .gitignore est présent
ls -la .gitignore
```

### 2. Créer le premier commit sur main

```bash
# Ajouter tous les fichiers
git add .

# Créer le commit initial
git commit -m "chore: initial commit - projet Vite & Gourmand"

# Si vous avez déjà un remote GitHub, l'ajouter
# git remote add origin https://github.com/votre-username/vite-gourmand.git
```

### 3. Créer la structure de branches

```bash
# Main est déjà la branche actuelle (par défaut)
# Créer la branche dev depuis main
git checkout -b dev

# Maintenant vous êtes sur dev
# Tous les futurs développements se feront depuis dev

# Voir les branches
git branch
```

### 4. Pousser vers GitHub (si vous avez un remote)

```bash
# Si vous avez un remote GitHub configuré
# Pousser main d'abord
git checkout main
git push -u origin main

# Pousser dev ensuite
git checkout dev
git push -u origin dev

# Définir dev comme branche par défaut sur GitHub (via interface web)
# Settings > Branches > Default branch > dev
```

### 5. Workflow pour les nouvelles fonctionnalités

```bash
# TOUJOURS partir de dev
git checkout dev
git pull origin dev  # S'assurer d'être à jour

# Créer une nouvelle branche feature
git checkout -b feature/nom-de-la-fonctionnalite

# Développer, puis commit
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser la branche feature
git push origin feature/nom-de-la-fonctionnalite

# Après validation, merger dans dev
git checkout dev
git merge feature/nom-de-la-fonctionnalite
git push origin dev

# Supprimer la branche feature (locale et distante)
git branch -d feature/nom-de-la-fonctionnalite
git push origin --delete feature/nom-de-la-fonctionnalite
```

### 6. Release : merger dev → main

```bash
# Quand dev est stable et prêt pour production
git checkout main
git pull origin main  # S'assurer d'être à jour

# Merger dev dans main
git merge dev

# Pousser main
git push origin main

# Revenir sur dev pour continuer le développement
git checkout dev
```

## ⚠️ Règles d'or

1. ✅ **MAIN** = Production (stable, testé, déployable)
2. ✅ **DEV** = Développement (intégration continue)
3. ✅ **FEATURE/*** = Nouvelles fonctionnalités (une par fonctionnalité)
4. ❌ **NE JAMAIS** pousser directement sur main
5. ✅ **TOUJOURS** créer une branche feature depuis dev
6. ✅ **TOUJOURS** merger feature → dev → main (dans cet ordre)

## 🔗 Si vous créez un nouveau dépôt GitHub

```bash
# 1. Créer le dépôt sur GitHub (via interface web)
# 2. Lier le dépôt local au remote
git remote add origin https://github.com/votre-username/vite-gourmand.git

# 3. Pousser main
git checkout main
git push -u origin main

# 4. Pousser dev
git checkout dev
git push -u origin dev

# 5. Définir dev comme branche par défaut sur GitHub
# (via Settings > Branches > Default branch)
```

## 📝 Convention de commits

Utilisez des messages de commit clairs :

```
feat: ajout de la page de gestion des commandes
fix: correction du calcul des prix de livraison
docs: mise à jour du README
refactor: amélioration de la structure du code
test: ajout de tests pour l'API
chore: mise à jour des dépendances
```

