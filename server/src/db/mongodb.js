/**
 * Service MongoDB pour les statistiques
 */

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'vite-gourmand-stats';

let client = null;
let db = null;

/**
 * Connecte à MongoDB
 */
export async function connectMongoDB() {
  if (db) return db;

  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
      console.log('[MongoDB] Connecté à la base de données');
    }
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('[MongoDB] Erreur de connexion:', error);
    // En développement, on peut continuer sans MongoDB (simulation)
    return null;
  }
}

/**
 * Enregistre une statistique de commande
 */
export async function saveOrderStats(orderData) {
  const database = await connectMongoDB();
  if (!database) {
    console.log('[MongoDB] Mode simulation : statistique commande non enregistrée');
    return { success: false, simulated: true };
  }

  try {
    const collection = database.collection('order_stats');
    await collection.insertOne({
      orderId: orderData.orderId,
      menuId: orderData.menuId,
      menuTitle: orderData.menuTitle,
      userId: orderData.userId,
      guests: orderData.guests,
      totalPrice: orderData.totalPrice,
      menuPrice: orderData.menuPrice,
      discountAmount: orderData.discountAmount,
      deliveryPrice: orderData.deliveryPrice,
      createdAt: new Date(),
      eventDate: orderData.eventDate ? new Date(orderData.eventDate) : null,
    });
    return { success: true };
  } catch (error) {
    console.error('[MongoDB] Erreur lors de l\'enregistrement:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère le nombre de commandes par menu
 */
export async function getOrdersByMenu() {
  const database = await connectMongoDB();
  if (!database) {
    console.log('[MongoDB] Mode simulation : retour données vides');
    return [];
  }

  try {
    const collection = database.collection('order_stats');
    const results = await collection
      .aggregate([
        {
          $group: {
            _id: '$menuId',
            menuTitle: { $first: '$menuTitle' },
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' },
            avgPrice: { $avg: '$totalPrice' },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray();

    return results.map((item) => ({
      menuId: item._id,
      menuTitle: item.menuTitle,
      orderCount: item.count,
      totalRevenue: item.totalRevenue || 0,
      averagePrice: item.avgPrice || 0,
    }));
  } catch (error) {
    console.error('[MongoDB] Erreur lors de la récupération:', error);
    return [];
  }
}

/**
 * Récupère le chiffre d'affaires par période
 */
export async function getRevenueByPeriod(startDate, endDate, menuId = null) {
  const database = await connectMongoDB();
  if (!database) {
    console.log('[MongoDB] Mode simulation : retour données vides');
    return { total: 0, byMenu: [] };
  }

  try {
    const collection = database.collection('order_stats');
    const match = { createdAt: {} };
    
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
    if (menuId) match.menuId = menuId;
    
    if (Object.keys(match.createdAt).length === 0) {
      delete match.createdAt;
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: menuId ? null : '$menuId',
          menuTitle: { $first: '$menuTitle' },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
    ];

    if (!menuId) {
      pipeline.push({ $sort: { totalRevenue: -1 } });
    }

    const results = await collection.aggregate(pipeline).toArray();

    const total = results.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);

    return {
      total,
      byMenu: results.map((item) => ({
        menuId: item._id,
        menuTitle: item.menuTitle,
        revenue: item.totalRevenue || 0,
        orderCount: item.orderCount || 0,
      })),
    };
  } catch (error) {
    console.error('[MongoDB] Erreur lors du calcul du CA:', error);
    return { total: 0, byMenu: [] };
  }
}

/**
 * Ferme la connexion MongoDB
 */
export async function closeMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[MongoDB] Connexion fermée');
  }
}

