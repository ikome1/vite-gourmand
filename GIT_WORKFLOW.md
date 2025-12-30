# 🌿 Workflow Git - Vite & Gourmand

Ce projet suit un workflow Git standard avec les branches suivantes :

## 📋 Structure des branches

```
main (production)
  ↑
dev (développement)
  ↑
feature/* (nouvelles fonctionnalités)
```

## 🔄 Workflow

### 1. **Branch `main`** (Production)
- ✅ Code stable et testé
- ✅ Prêt pour déploiement
- ✅ **NE JAMAIS** pousser directement sur main
- ✅ Uniquement des merges depuis `dev` après validation

### 2. **Branch `dev`** (Développement)
- ✅ Branche principale de développement
- ✅ Code intégré et testé
- ✅ Merge depuis les branches `feature/*`
- ✅ Tests d'intégration

### 3. **Branches `feature/*`** (Fonctionnalités)
- ✅ Une branche par nouvelle fonctionnalité
- ✅ Créée depuis `dev`
- ✅ Nommage : `feature/nom-de-la-fonctionnalite`
- ✅ Merge dans `dev` après validation

## 📝 Commandes Git essentielles

### Créer une nouvelle fonctionnalité

```bash
# 1. S'assurer d'être sur dev et à jour
git checkout dev
git pull origin dev

# 2. Créer une nouvelle branche feature
git checkout -b feature/nom-de-la-fonctionnalite

# 3. Développer et commiter
git add .
git commit -m "feat: description de la fonctionnalité"

# 4. Pousser la branche feature
git push origin feature/nom-de-la-fonctionnalite

# 5. Après validation, merger dans dev
git checkout dev
git merge feature/nom-de-la-fonctionnalite
git push origin dev

# 6. Supprimer la branche feature locale
git branch -d feature/nom-de-la-fonctionnalite
```

### Merger dev vers main (release)

```bash
# 1. S'assurer que dev est à jour et stable
git checkout dev
git pull origin dev

# 2. Merger dev dans main
git checkout main
git merge dev

# 3. Pousser main
git push origin main

# 4. Créer un tag de version si nécessaire
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

## 🏷️ Convention de commit

Utilisez des messages de commit clairs avec préfixes :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style (pas de changement de code)
- `refactor:` Refactoring du code
- `test:` Ajout/modification de tests
- `chore:` Tâches de maintenance

Exemples :
```bash
git commit -m "feat: ajout de la page de gestion des commandes"
git commit -m "fix: correction du calcul des prix de livraison"
git commit -m "docs: mise à jour du README"
```

## ⚠️ Règles importantes

1. **NE JAMAIS** pousser directement sur `main`
2. **TOUJOURS** créer une branche `feature/*` pour toute nouvelle fonctionnalité
3. **TOUJOURS** merger `feature/*` → `dev` d'abord
4. **UNIQUEMENT** merger `dev` → `main` pour les releases
5. **TOUJOURS** faire un `git pull` avant de merger
6. Tester avant de merger dans `dev`
7. Valider avant de merger `dev` → `main`

## 🔧 Setup initial (à faire une seule fois)

Si vous démarrez un nouveau projet ou réorganisez le dépôt :

```bash
# 1. Créer la branche dev depuis main
git checkout main
git checkout -b dev
git push origin dev

# 2. Définir dev comme branche par défaut (optionnel)
git checkout dev
```

## 📚 Ressources

- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)

