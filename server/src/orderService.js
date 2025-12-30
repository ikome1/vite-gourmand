import { nanoid } from 'nanoid';
import { queryOne, run, transaction } from './db.js';

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

  const orderId = nanoid(18);

  const execute = transaction(() => {
    run(
      `INSERT INTO orders (id, user_id, menu_id, guests, event_date, delivery_address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [orderId, userId, menuId, guests, eventDate, deliveryAddress, notes ?? null]
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

  return {
    success: true,
    order: {
      id: order.id,
      menuId: order.menu_id,
      menuTitle: order.menu_title,
      userId: order.user_id,
      guests: toNumber(order.guests),
      eventDate: order.event_date,
      deliveryAddress: order.delivery_address,
      notes: order.notes ?? undefined,
      status: order.status,
      createdAt: order.created_at,
    },
  };
}
