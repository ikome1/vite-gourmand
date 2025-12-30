import { nanoid } from 'nanoid';
import { queryOne, run, transaction, query } from './db.js';
import { calculateOrderPrice } from './utils/priceCalculator.js';
import { saveOrderStats } from './db/mongodb.js';
import { sendOrderCompletedEmail, sendEquipmentReturnReminderEmail } from './utils/emailService.js';

function toNumber(value) {
  return typeof value === 'bigint' ? Number(value) : value;
}

export function createOrder({ userId, menuId, guests, eventDate, deliveryAddress, notes }) {
  const menu = queryOne('SELECT * FROM menus WHERE id = ?', [menuId]);
  if (!menu) {
    return { success: false, status: 404, message: 'Menu introuvable.' };
  }

  const minimumGuests = toNumber(menu.minimum_guests);
  if (guests < minimumGuests) {
    return {
      success: false,
      status: 400,
      message: `Le nombre de convives doit être supérieur ou égal à ${minimumGuests}.`,
    };
  }

  const currentStock = toNumber(menu.stock);
  if (currentStock <= 0) {
    return {
      success: false,
      status: 400,
      message: 'Stock insuffisant sur ce menu.',
    };
  }

  // Calculer le prix de la commande
  const priceCalculation = calculateOrderPrice({
    basePrice: toNumber(menu.base_price),
    pricePerAdditionalGuest: menu.price_per_additional_guest ? toNumber(menu.price_per_additional_guest) : 0,
    minimumGuests,
    guests,
    deliveryAddress,
  });

  const orderId = nanoid(18);

  const execute = transaction(() => {
    run(
      `INSERT INTO orders (
        id, user_id, menu_id, guests, event_date, delivery_address, notes,
        menu_price, discount_amount, delivery_price, total_price, status
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente')` ,
      [
        orderId,
        userId,
        menuId,
        guests,
        eventDate,
        deliveryAddress,
        notes ?? null,
        priceCalculation.menuPrice,
        priceCalculation.discountAmount,
        priceCalculation.deliveryPrice,
        priceCalculation.totalPrice,
      ]
    );

    run('UPDATE menus SET stock = stock - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [menuId]);

    run(
      `INSERT INTO order_history (order_id, status, comment)
       VALUES (?, 'en_attente', 'Commande créée depuis le portail client.')`,
      [orderId]
    );
  });

  execute();

  const order = queryOne(
    `SELECT o.*, m.title AS menu_title FROM orders o JOIN menus m ON m.id = o.menu_id WHERE o.id = ?`,
    [orderId]
  );

  const orderResult = {
    id: order.id,
    menuId: order.menu_id,
    menuTitle: order.menu_title,
    userId: order.user_id,
    guests: toNumber(order.guests),
    eventDate: order.event_date,
    deliveryAddress: order.delivery_address,
    notes: order.notes ?? undefined,
    status: order.status,
    menuPrice: order.menu_price ? toNumber(order.menu_price) : null,
    discountAmount: order.discount_amount ? toNumber(order.discount_amount) : 0,
    deliveryPrice: order.delivery_price ? toNumber(order.delivery_price) : 0,
    totalPrice: order.total_price ? toNumber(order.total_price) : null,
    createdAt: order.created_at,
  };

  // Enregistrer dans MongoDB pour les statistiques (en arrière-plan, ne pas bloquer)
  saveOrderStats({
    orderId: orderResult.id,
    menuId: orderResult.menuId,
    menuTitle: orderResult.menuTitle,
    userId: orderResult.userId,
    guests: orderResult.guests,
    totalPrice: orderResult.totalPrice || 0,
    menuPrice: orderResult.menuPrice || 0,
    discountAmount: orderResult.discountAmount || 0,
    deliveryPrice: orderResult.deliveryPrice || 0,
    eventDate: orderResult.eventDate,
  }).catch((error) => {
    console.error('[OrderService] Erreur lors de l\'enregistrement dans MongoDB:', error);
    // Ne pas faire échouer la commande si MongoDB échoue
  });

  return {
    success: true,
    order: orderResult,
  };
}

/**
 * Récupère une commande par son ID avec tous les détails
 */
export function getOrderById(orderId) {
  const order = queryOne(
    `SELECT o.*, m.title AS menu_title FROM orders o JOIN menus m ON m.id = o.menu_id WHERE o.id = ?`,
    [orderId]
  );

  if (!order) return null;

  return {
    id: order.id,
    menuId: order.menu_id,
    menuTitle: order.menu_title,
    userId: order.user_id,
    guests: toNumber(order.guests),
    eventDate: order.event_date,
    deliveryAddress: order.delivery_address,
    notes: order.notes ?? undefined,
    status: order.status,
    menuPrice: order.menu_price ? toNumber(order.menu_price) : null,
    discountAmount: order.discount_amount ? toNumber(order.discount_amount) : 0,
    deliveryPrice: order.delivery_price ? toNumber(order.delivery_price) : 0,
    totalPrice: order.total_price ? toNumber(order.total_price) : null,
    createdAt: order.created_at,
  };
}

/**
 * Met à jour une commande (uniquement si statut = "en_attente")
 */
export function updateOrder(orderId, userId, { guests, eventDate, deliveryAddress, notes }) {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, status: 404, message: 'Commande introuvable.' };
  }

  // Vérifier que la commande appartient à l'utilisateur
  if (order.userId !== userId) {
    return { success: false, status: 403, message: 'Accès refusé.' };
  }

  // Vérifier que la commande est en attente
  if (order.status !== 'en_attente') {
    return {
      success: false,
      status: 400,
      message: 'Cette commande ne peut plus être modifiée car elle a déjà été acceptée.',
    };
  }

  // Récupérer le menu pour recalculer le prix
  const menu = queryOne('SELECT * FROM menus WHERE id = ?', [order.menuId]);
  if (!menu) {
    return { success: false, status: 404, message: 'Menu introuvable.' };
  }

  const minimumGuests = toNumber(menu.minimum_guests);
  if (guests && guests < minimumGuests) {
    return {
      success: false,
      status: 400,
      message: `Le nombre de convives doit être supérieur ou égal à ${minimumGuests}.`,
    };
  }

  // Recalculer le prix si nécessaire
  const finalGuests = guests ?? order.guests;
  const finalDeliveryAddress = deliveryAddress ?? order.deliveryAddress;

  const priceCalculation = calculateOrderPrice({
    basePrice: toNumber(menu.base_price),
    pricePerAdditionalGuest: menu.price_per_additional_guest ? toNumber(menu.price_per_additional_guest) : 0,
    minimumGuests,
    guests: finalGuests,
    deliveryAddress: finalDeliveryAddress,
  });

  const execute = transaction(() => {
    run(
      `UPDATE orders SET
        guests = ?,
        event_date = ?,
        delivery_address = ?,
        notes = ?,
        menu_price = ?,
        discount_amount = ?,
        delivery_price = ?,
        total_price = ?
       WHERE id = ?`,
      [
        finalGuests,
        eventDate ?? order.eventDate,
        finalDeliveryAddress,
        notes !== undefined ? notes : order.notes,
        priceCalculation.menuPrice,
        priceCalculation.discountAmount,
        priceCalculation.deliveryPrice,
        priceCalculation.totalPrice,
        orderId,
      ]
    );

    run(
      `INSERT INTO order_history (order_id, status, comment)
       VALUES (?, 'en_attente', 'Commande modifiée par le client.')`,
      [orderId]
    );
  });

  execute();

  return { success: true, order: getOrderById(orderId) };
}

/**
 * Récupère l'historique d'une commande
 */
export function getOrderHistory(orderId) {
  const rows = query(
    'SELECT * FROM order_history WHERE order_id = ? ORDER BY created_at ASC',
    [orderId]
  );

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
  }));
}

/**
 * Met à jour le statut d'une commande
 */
export async function updateOrderStatus(orderId, newStatus, comment, userId) {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, status: 404, message: 'Commande introuvable.' };
  }

  const execute = transaction(() => {
    run('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);

    run(
      `INSERT INTO order_history (order_id, status, comment)
       VALUES (?, ?, ?)`,
      [orderId, newStatus, comment ?? `Statut changé à "${newStatus}" par l'utilisateur ${userId}.`]
    );
  });

  execute();

  // Envoyer un email si la commande est terminée
  if (newStatus === 'terminee') {
    const user = queryOne('SELECT email FROM users WHERE id = ?', [order.userId]);
    if (user) {
      await sendOrderCompletedEmail(user.email, orderId);
    }
  }

  // Envoyer un email si en attente de retour de matériel
  if (newStatus === 'en_attente_retour_materiel') {
    const user = queryOne('SELECT email FROM users WHERE id = ?', [order.userId]);
    if (user) {
      await sendEquipmentReturnReminderEmail(user.email, orderId);
    }
  }

  return { success: true, order: getOrderById(orderId) };
}

/**
 * Annule une commande
 */
export function cancelOrder(orderId, userId, reason) {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, status: 404, message: 'Commande introuvable.' };
  }

  // Vérifier que la commande appartient à l'utilisateur
  if (order.userId !== userId) {
    return { success: false, status: 403, message: 'Accès refusé.' };
  }

  // Vérifier que la commande peut être annulée
  if (order.status === 'terminee' || order.status === 'annulee') {
    return {
      success: false,
      status: 400,
      message: 'Cette commande ne peut plus être annulée.',
    };
  }

  const execute = transaction(() => {
    run('UPDATE orders SET status = ? WHERE id = ?', ['annulee', orderId]);

    // Remettre le stock du menu
    run('UPDATE menus SET stock = stock + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      order.menuId,
    ]);

    run(
      `INSERT INTO order_history (order_id, status, comment)
       VALUES (?, 'annulee', ?)`,
      [orderId, reason || 'Commande annulée par le client.']
    );
  });

  execute();

  return { success: true, order: getOrderById(orderId) };
}
