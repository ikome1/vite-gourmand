# 🌿 Guide Git - Résumé Rapide

## Structure actuelle

```
main (production - stable)
  ↑
dev (développement - branche de travail principale)
  ↑
feature/* (nouvelles fonctionnalités)
```

## 🚀 Commandes essentielles

### Travailler sur une nouvelle fonctionnalité

```bash
# 1. Partir de dev (toujours à jour)
git checkout dev
git pull origin dev

# 2. Créer une branche feature
git checkout -b feature/nom-fonctionnalite

# 3. Développer et commiter
git add .
git commit -m "feat: description"

# 4. Pousser
git push origin feature/nom-fonctionnalite

# 5. Merger dans dev (après validation)
git checkout dev
git merge feature/nom-fonctionnalite
git push origin dev
```

### Release (dev → main)

```bash
git checkout main
git merge dev
git push origin main
git checkout dev  # Revenir sur dev
```

## ⚠️ Règles

- ❌ Ne **JAMAIS** pousser directement sur `main`
- ✅ Toujours créer une `feature/*` depuis `dev`
- ✅ Toujours merger `feature` → `dev` → `main`
- ✅ Toujours faire `git pull` avant de merger

## 📚 Documentation complète

- `GIT_WORKFLOW.md` - Workflow détaillé
- `SETUP_GIT.md` - Guide de setup
- `MIGRATION_GIT.md` - Guide de migration

