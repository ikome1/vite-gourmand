# 📋 Plan d'Implémentation des Fonctionnalités Manquantes

## ✅ Déjà implémenté dans cette session

### Backend

1. ✅ **Service de calcul de prix** (`server/src/utils/priceCalculator.js`)
   - Calcul du prix du menu selon le nombre de convives
   - Réduction de 10% si 5+ personnes supplémentaires
   - Calcul du prix de livraison (5€ + 0,59€/km hors Bordeaux)

2. ✅ **Service d'emails** (`server/src/utils/emailService.js`)
   - Structure créée pour tous les types d'emails
   - Pour l'instant en simulation (console.log)
   - Prêt pour intégration NodeMailer

3. ✅ **Amélioration orderService** (`server/src/orderService.js`)
   - Calcul et stockage des prix dans la base
   - Fonctions pour récupérer une commande par ID
   - Fonction pour récupérer l'historique
   - Fonctions pour mettre à jour le statut
   - Fonction pour annuler une commande

4. ✅ **Nouveaux endpoints API** (`server/src/index.js`)
   - `GET /api/orders/:id` - Détail d'une commande
   - `GET /api/orders/:id/history` - Historique d'une commande
   - `PATCH /api/orders/:id/status` - Mettre à jour le statut (admin/employé)
   - `DELETE /api/orders/:id` - Annuler une commande
   - `GET /api/orders` - Amélioré avec filtres pour admin/employé

5. ✅ **Amélioration auth** (`server/src/auth.js`)
   - Email de bienvenue envoyé à l'inscription

6. ✅ **Migration base de données** (`server/src/migrations/add_order_price_fields.sql`)
   - Ajout des colonnes prix dans orders
   - Table contact_requests
   - Colonnes pour avis liés aux commandes

---

## ⚠️ À FAIRE - Backend

### 1. Appliquer les migrations SQL

**Action requise** :
```bash
cd server
sqlite3 data/vite-gourmand.db < src/migrations/add_order_price_fields.sql
```

Ou créer un script pour appliquer les migrations automatiquement.

### 2. Intégrer NodeMailer (système d'emails réel)

**À installer** :
```bash
cd server
npm install nodemailer
```

**À configurer** :
- Créer un fichier `.env` avec les paramètres SMTP
- Implémenter les fonctions dans `emailService.js`

### 3. Endpoints manquants

#### Contact
```javascript
app.post('/api/contact', async (req, res) => {
  // Sauvegarder dans contact_requests
  // Envoyer email à l'entreprise
});
```

#### Gestion utilisateurs (admin)
```javascript
// Créer compte employé
app.post('/api/admin/employees', async (req, res) => {
  // Créer un compte employé
  // Envoyer email de notification (sans mot de passe)
});

// Désactiver compte employé
app.patch('/api/admin/employees/:id/disable', async (req, res) => {
  // Désactiver un compte
});

// Liste des employés
app.get('/api/admin/employees', async (req, res) => {
  // Lister tous les employés
});
```

#### Statistiques (admin)
```javascript
// Nécessite MongoDB installé
app.get('/api/admin/statistics/orders-by-menu', async (req, res) => {
  // Récupérer depuis MongoDB
});

app.get('/api/admin/statistics/revenue', async (req, res) => {
  // Chiffre d'affaires par menu/période
});
```

#### Avis
```javascript
// Créer un avis depuis une commande
app.post('/api/orders/:id/testimonial', async (req, res) => {
  // Créer un avis lié à une commande
  // pending_validation = 1
});

// Valider/refuser un avis (employé/admin)
app.patch('/api/testimonials/:id/validate', async (req, res) => {
  // Valider ou refuser un avis
});
```

#### Profil utilisateur
```javascript
// Mettre à jour le profil
app.patch('/api/users/me', async (req, res) => {
  // Mettre à jour les informations de l'utilisateur connecté
});
```

---

## ⚠️ À FAIRE - Frontend

### 1. Page Espace Utilisateur (`app/src/pages/UserSpacePage.tsx`)

**Nouveau fichier à créer** avec :
- Liste des commandes de l'utilisateur
- Détail de chaque commande
- Bouton pour voir le suivi
- Bouton pour annuler (si statut = "en_attente")
- Formulaire pour modifier le profil
- Formulaire pour donner un avis (si commande terminée)

### 2. Page Détail Commande (`app/src/pages/OrderDetailPage.tsx`)

**Nouveau fichier à créer** avec :
- Détails complets de la commande
- Historique des statuts
- Bouton annuler (si possible)
- Bouton pour donner avis (si terminée)

### 3. Améliorer OrderPage (`app/src/pages/OrderPage.tsx`)

**À modifier** :
- Ajouter le calcul et affichage du prix en temps réel
- Afficher la réduction si applicable
- Afficher le prix de livraison
- Afficher le total
- Afficher la décomposition du prix

### 4. Page Gestion Commandes (Employé/Admin) (`app/src/pages/OrdersManagementPage.tsx`)

**Nouveau fichier à créer** avec :
- Liste de toutes les commandes
- Filtres (statut, client)
- Actions pour changer le statut
- Modal pour annuler avec motif
- Vue détaillée d'une commande

### 5. Améliorer ProSpacePage (`app/src/pages/ProSpacePage.tsx`)

**À ajouter** :
- Section pour gérer les commandes (si admin/employé)
- Section admin (création comptes employés, statistiques)
- Validation des avis en attente

### 6. Nouvelle page Admin (`app/src/pages/AdminPage.tsx`)

**Nouveau fichier à créer** avec :
- Création de comptes employés
- Liste des employés avec désactivation
- Statistiques avec graphiques
- Chiffre d'affaires

### 7. Améliorer ContactPage (`app/src/pages/ContactPage.tsx`)

**À modifier** :
- Envoyer réellement le formulaire à l'API
- Afficher message de succès

### 8. Formulaire d'avis (`app/src/components/TestimonialForm.tsx`)

**Nouveau composant** :
- Rating 1-5 étoiles
- Commentaire
- Lien depuis OrderDetailPage

---

## 📦 Dépendances à installer

### Backend
```bash
cd server
npm install nodemailer mongodb
```

### Frontend
```bash
cd app
npm install recharts  # Pour les graphiques
# ou
npm install chart.js react-chartjs-2
```

---

## 🗄️ Base de données NoSQL (MongoDB)

### Installation

**Option 1 : MongoDB local**
```bash
# macOS
brew install mongodb-community

# Démarrage
brew services start mongodb-community
```

**Option 2 : MongoDB Atlas (cloud gratuit)**
- Créer un compte sur https://www.mongodb.com/cloud/atlas
- Créer un cluster gratuit
- Récupérer l'URI de connexion

### Service MongoDB

Créer `server/src/db/mongodb.js` :

```javascript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'vite-gourmand-stats';

let db = null;

export async function connectMongoDB() {
  if (db) return db;
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function saveOrderStats(orderData) {
  const db = await connectMongoDB();
  const collection = db.collection('order_stats');
  await collection.insertOne({
    ...orderData,
    createdAt: new Date(),
  });
}

export async function getOrdersByMenu() {
  const db = await connectMongoDB();
  const collection = db.collection('order_stats');
  return collection.aggregate([
    { $group: { _id: '$menuId', count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } },
  ]).toArray();
}
```

---

## 🔧 Variables d'environnement

### Backend (`.env`)
```env
# Email (NodeMailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# MongoDB
MONGODB_URI=mongodb://localhost:27017
# ou pour Atlas
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/

# Frontend URL (pour liens dans emails)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:4000
```

---

## 📝 Étapes suivantes recommandées

### Priorité 1 (Critique)
1. Appliquer les migrations SQL
2. Créer la page Espace Utilisateur
3. Améliorer OrderPage avec calcul prix
4. Créer la page Gestion Commandes (employé/admin)

### Priorité 2 (Important)
5. Intégrer NodeMailer
6. Créer la page Admin
7. Intégrer MongoDB pour statistiques
8. Formulaire d'avis

### Priorité 3 (Nice to have)
9. Améliorer ContactPage
10. Tests end-to-end

---

## 📚 Documentation à créer

1. **Guide de déploiement** avec emails et MongoDB
2. **Documentation API** (Swagger/OpenAPI)
3. **Guide utilisateur** (manuel PDF)
4. **Charte graphique** (PDF)

---

*Document créé le : 26 décembre 2024*
*Dernière mise à jour : Session d'implémentation initiale*

