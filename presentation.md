# Présentation du projet Vite & Gourmand

## Contexte

**Vite & Gourmand** est une entreprise bordelaise fondée par Julie (cheffe) et José (maître d’hôtel). Depuis 25 ans, ils organisent des prestations de traiteur haut de gamme pour tous types d’événements (Noël, Pâques, mariages, brunchs professionnels, etc.). Leur fonctionnement reposait jusqu’à présent sur des échanges par e-mail avec leurs clients historiques. Afin de gagner en visibilité et de simplifier la diffusion de leurs menus, FastDev a été missionné pour concevoir une application web complète.

## Objectifs fonctionnels

- Présenter l’entreprise, son savoir-faire et ses avis clients vérifiés.
- Publier et filtrer des menus thématiques détaillant prix, conditions, allergènes, visuels.
- Permettre aux visiteurs de créer un compte, de s’authentifier et de commander un menu.
- Offrir un espace professionnel aux collaborateurs (employés/administrateurs) pour gérer les stocks et ajouter des menus.
- Respecter les obligations réglementaires (RGPD, mentions légales, CGV, gestion des avis).

## Architecture globale

```
Vite & Gourmand /
├── app/       # Front-end React + TypeScript + Vite
├── server/    # API Express + SQLite
├── presentation.md
├── fonctionnement.md
└── README.md
```

- **Front-end** : SPA React consommant l’API via `fetch`, navigation gérée par `react-router-dom`, contexts pour l’authentification et les menus, design en CSS custom responsive.
- **Back-end** : serveur Express, base SQLite (via `better-sqlite3`), validation d’entrées avec Zod, gestion simple des sessions en mémoire, endpoints REST sécurisés par rôles.

## Outils & technologies

| Domaine | Technologies | Rôle |
|---------|--------------|------|
| Front | React 18, TypeScript, Vite, React Router | Interface utilisateur, filtres dynamiques, formulaires |
| UI/UX | CSS custom, maquettes inspirées du brief | Composants (header/footer, cartes, témoignages) |
| Données | Context API + hooks personnalisés | Gestion du state (menus, auth) synchronisé avec l’API |
| Back | Node.js, Express 4, better-sqlite3 | API REST sécurisée, CRUD menus/commandes/utilisateurs |
| Validation | Zod | Validation des payloads côté serveur |
| Sécurité | SHA-256 pour mots de passe, sessions en mémoire, rôles | Authentification & autorisations |
| Données initiales | Scripts de seed SQLite | Comptes de démo, menus, plats, allergènes, témoignages |

## Fonctionnalités livrées

- **Accueil** : hero marketing, présentation de l’entreprise, professionnalisme, avis clients vérifiés.
- **Catalogue des menus** : filtre par thème, régime, prix max, fourchette de prix, nombre de convives, recherche texte.
- **Détail d’un menu** : visuels, conditions, cours (entrées/plats/desserts), allergènes, bouton commander (auth requise).
- **Compte utilisateur** : inscription (contrôles RGPD), connexion, mot de passe oublié (simulation d’email).
- **Commande** : formulaire pré-rempli, contrôle du stock, création d’un enregistrement côté serveur.
- **Espace pro** : liste des menus avec modification du stock, formulaire d’ajout rapide (roles `employe`/`administrateur`).
- **Pages légales** : mentions légales, CGV, contact (avec consentement explicite).

## Conformité & qualité

- Textes 100% en français (front + back).
- Mentions obligatoires visibles dans le pied de page et pages dédiées.
- Avis clients filtrés sur `validated = 1`.
- Protection RGPD : consentement explicite pour le formulaire contact, mention de la finalité et du droit d’accès.
- Gestion des allergènes détaillée pour chaque plat.
- Respect des contraintes techniques (Node ≥ 20 recommandé pour le build front, Node ≥ 18 pour l’API).

## Accounts & données de démonstration

- Administrateur : `julie@vite-gourmand.fr` / `Admin2025!`
- Employé : `jose@vite-gourmand.fr` / `Employe2025!`
- Menus (Noël, Pâques, Brunch, Vegan événementiel) préchargés avec plats et allergènes.
- Témoignages validés pour afficher la crédibilité de l’entreprise.

## Pistes d’évolutions

- Gestion fine des plats côté espace pro (CRUD complet avec choix d’allergènes).
- Remplacement des sessions mémoire par des JWT ou un store partagé (Redis) pour la production.
- Envoi réel des e-mails (bienvenue, reset mot de passe) via un fournisseur (SendGrid, Mailjet…).
- Module d’export PDF/CSV pour les commandes et menus.
- Interface multilingue si l’activité dépasse la clientèle francophone.

