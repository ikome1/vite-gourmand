# 🔄 Plan de Migration Git

## Situation actuelle
- Code actuellement sur `main` (ou `master`)
- Pas de structure de branches

## Objectif
- `main` : production (stable)
- `dev` : développement (intégration)
- `feature/*` : nouvelles fonctionnalités

## ✅ Plan d'action recommandé

### Option 1 : Restructuration propre (Recommandée)

```bash
# 1. S'assurer que tous les changements sont commités
git status
git add .
git commit -m "chore: préparation de la migration vers workflow Git flow"

# 2. Créer la branche dev depuis main (contient tout le code actuel)
git checkout -b dev
git push origin dev

# 3. Maintenir main comme branche de production (actuellement identique à dev)
# Main est déjà prête, pas besoin de changer

# 4. Définir dev comme branche de travail principale
git checkout dev

# 5. Pour les prochaines fonctionnalités, créer depuis dev
git checkout -b feature/nom-fonctionnalite
# ... travailler ...
git checkout dev
git merge feature/nom-fonctionnalite
```

### Option 2 : Si vous voulez réinitialiser main

Si vous voulez que main soit vraiment "vierge" (non recommandé si le code est déjà déployé) :

```bash
# ⚠️ ATTENTION : Cette option efface l'historique sur main
# Ne faire QUE si vous êtes sûr et si main n'est pas déjà utilisée en production

# 1. Sauvegarder le code actuel dans dev
git checkout -b dev
git push origin dev

# 2. Revenir sur main et créer un commit initial propre
git checkout main
# Créer un commit initial ou réinitialiser
```

## 🎯 Recommandation

**Utiliser l'Option 1** car :
- ✅ Préserve tout l'historique
- ✅ Main et dev partent du même point
- ✅ Pas de perte de données
- ✅ Simple et rapide

Après cette migration :
- `main` = code stable actuel
- `dev` = même code, servira pour les nouvelles fonctionnalités
- Toutes les nouvelles features partiront de `dev`

