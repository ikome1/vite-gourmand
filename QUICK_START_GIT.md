# ⚡ Quick Start Git - 3 Commandes

## 🔧 Setup rapide (copier-coller)

```bash
cd /Users/idrissakome/Downloads/vite-gourmand-main

# 1. Configurer Git (remplacez par vos infos)
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"

# 2. Commiter tout le projet
git add .
git commit -m "chore: initial commit - projet Vite & Gourmand"

# 3. Vérifier que vous êtes sur dev (la branche de travail)
git branch
# Vous devriez voir * dev
```

## ✅ C'est fait !

Vous êtes maintenant sur la branche `dev`, qui est votre branche de travail principale.

## 🎯 Pour les prochaines fonctionnalités

```bash
# Créer une branche feature depuis dev
git checkout dev
git checkout -b feature/nom-fonctionnalite

# ... développer ...
git add .
git commit -m "feat: ma nouvelle fonctionnalité"
git push origin feature/nom-fonctionnalite

# Merger dans dev après validation
git checkout dev
git merge feature/nom-fonctionnalite
git push origin dev
```

## 📚 Plus de détails

- `COMMANDES_GIT.md` - Guide complet avec toutes les commandes
- `GIT_WORKFLOW.md` - Explications détaillées du workflow
- `SETUP_GIT.md` - Setup complet avec GitHub

