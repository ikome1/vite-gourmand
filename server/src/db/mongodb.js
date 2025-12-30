// Service d'accès aux données NoSQL avec MongoDB
// Utilisé pour les logs d'activité et données analytiques

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'vite-gourmand';
const COLLECTION_LOGS = 'activity_logs';

let client = null;
let db = null;

/**
 * Connexion à MongoDB
 */
export async function connectMongoDB() {
  if (client) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connexion MongoDB établie');
    return db;
  } catch (error) {
    console.warn('⚠️  MongoDB non disponible, utilisation de SQLite uniquement:', error.message);
    return null;
  }
}

/**
 * Enregistrer un log d'activité dans MongoDB
 */
export async function logActivity(activity) {
  try {
    const database = await connectMongoDB();
    if (!database) return null;

    const collection = database.collection(COLLECTION_LOGS);
    const logEntry = {
      ...activity,
      timestamp: new Date(),
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(logEntry);
    return result.insertedId;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log MongoDB:', error);
    return null;
  }
}

/**
 * Récupérer les logs d'activité
 */
export async function getActivityLogs(filters = {}, limit = 100) {
  try {
    const database = await connectMongoDB();
    if (!database) return [];

    const collection = database.collection(COLLECTION_LOGS);
    const logs = await collection
      .find(filters)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs;
  } catch (error) {
    console.error('Erreur lors de la récupération des logs MongoDB:', error);
    return [];
  }
}

/**
 * Fermer la connexion MongoDB
 */
export async function closeMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB déconnecté');
  }
}

