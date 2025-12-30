import { nanoid } from 'nanoid';
import { query, queryOne, run, transaction } from './db.js';

function toNumber(value) {
  return typeof value === 'bigint' ? Number(value) : value;
}

export function listMenus(filters = {}) {
  let sql = `SELECT * FROM menu_view WHERE 1=1`;
  const params = [];

  if (filters.theme && filters.theme !== 'Tous') {
    sql += ' AND theme = ?';
    params.push(filters.theme);
  }

  if (filters.regime && filters.regime !== 'Tous') {
    sql += ' AND regime = ?';
    params.push(filters.regime);
  }

  if (typeof filters.maxPrice === 'number') {
    sql += ' AND base_price <= ?';
    params.push(filters.maxPrice);
  }

  if (Array.isArray(filters.priceRange) && filters.priceRange.length === 2) {
    sql += ' AND base_price >= ? AND base_price <= ?';
    params.push(filters.priceRange[0], filters.priceRange[1]);
  }

  if (typeof filters.minimumGuests === 'number') {
    sql += ' AND minimum_guests >= ?';
    params.push(filters.minimumGuests);
  }

  if (filters.search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = query(sql, params);

  return rows.map((row) => {
    const images = row.images ? JSON.parse(row.images) : ['/assets/menu-generic.svg'];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      theme: row.theme,
      regime: row.regime,
      minimumGuests: toNumber(row.minimum_guests),
      basePrice: toNumber(row.base_price),
      pricePerAdditionalGuest: row.price_per_additional_guest ? toNumber(row.price_per_additional_guest) : undefined,
      stock: toNumber(row.stock),
      images,
      conditions: {
        orderingNotice: row.conditions_ordering,
        storage: row.conditions_storage,
        notes: row.conditions_notes ?? undefined,
      },
      highlight: row.highlight ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export function getMenu(menuId) {
  const row = queryOne('SELECT * FROM menu_view WHERE id = ?', [menuId]);
  if (!row) return null;

  const images = row.images ? JSON.parse(row.images) : ['/assets/menu-generic.svg'];

  const dishes = query(
    `SELECT d.id, d.name, d.description, d.course_type, d.is_signature,
            (SELECT json_group_array(a.code)
             FROM allergens a
             JOIN dish_allergens da ON da.allergen_id = a.id
             WHERE da.dish_id = d.id) AS allergens
     FROM dishes d
     JOIN menu_dishes md ON md.dish_id = d.id
     WHERE md.menu_id = ?
     ORDER BY md.sort_order, d.course_type, d.name`,
    [menuId]
  );

  const entrees = [];
  const plats = [];
  const desserts = [];

  dishes.forEach((dish) => {
    const allergens = dish.allergens ? JSON.parse(dish.allergens) : [];
    const dishObj = {
      id: dish.id,
      name: dish.name,
      description: dish.description,
      allergens,
      isSignature: Boolean(dish.is_signature),
    };

    if (dish.course_type === 'Entrée') entrees.push(dishObj);
    else if (dish.course_type === 'Plat') plats.push(dishObj);
    else if (dish.course_type === 'Dessert') desserts.push(dishObj);
  });

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    theme: row.theme,
    regime: row.regime,
    minimumGuests: toNumber(row.minimum_guests),
    basePrice: toNumber(row.base_price),
    pricePerAdditionalGuest: row.price_per_additional_guest ? toNumber(row.price_per_additional_guest) : undefined,
    stock: toNumber(row.stock),
    images,
    conditions: {
      orderingNotice: row.conditions_ordering,
      storage: row.conditions_storage,
      notes: row.conditions_notes ?? undefined,
    },
    highlight: row.highlight ?? undefined,
    courses: {
      entrees,
      plats,
      desserts,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function updateMenuStock(menuId, stock) {
  const result = run('UPDATE menus SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [stock, menuId]);
  return result.changes > 0;
}

export function createMenu(payload) {
  const id = nanoid(16);
  const menu = {
    id,
    title: payload.title,
    description: payload.description,
    theme: payload.theme,
    regime: payload.regime,
    minimum_guests: payload.minimumGuests,
    base_price: payload.basePrice,
    price_per_additional_guest: payload.pricePerAdditionalGuest ?? null,
    stock: payload.stock ?? 0,
    highlight: payload.highlight ?? null,
    conditions_ordering: payload.conditions?.orderingNotice ?? 'Commande 5 jours avant la prestation.',
    conditions_storage: payload.conditions?.storage ?? 'Conserver entre 0°C et 4°C.',
    conditions_notes: payload.conditions?.notes ?? null,
  };

  const execute = transaction(() => {
    run(
      `INSERT INTO menus (
        id, title, description, theme, regime, minimum_guests, base_price,
        price_per_additional_guest, stock, highlight,
        conditions_ordering, conditions_storage, conditions_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        menu.id,
        menu.title,
        menu.description,
        menu.theme,
        menu.regime,
        menu.minimum_guests,
        menu.base_price,
        menu.price_per_additional_guest,
        menu.stock,
        menu.highlight,
        menu.conditions_ordering,
        menu.conditions_storage,
        menu.conditions_notes,
      ]
    );

    const images = payload.images?.length ? payload.images : ['/assets/menu-generic.svg'];
    images.forEach((url, index) => {
      run('INSERT INTO menu_images (menu_id, url, sort_order) VALUES (?, ?, ?)', [menu.id, url, index]);
    });
  });

  execute();

  return getMenu(menu.id);
}

/**
 * Met à jour un menu existant
 */
export function updateMenu(menuId, payload) {
  const existing = queryOne('SELECT id FROM menus WHERE id = ?', [menuId]);
  if (!existing) {
    return { success: false, status: 404, message: 'Menu introuvable.' };
  }

  const execute = transaction(() => {
    run(
      `UPDATE menus SET
        title = ?,
        description = ?,
        theme = ?,
        regime = ?,
        minimum_guests = ?,
        base_price = ?,
        price_per_additional_guest = ?,
        stock = ?,
        highlight = ?,
        conditions_ordering = ?,
        conditions_storage = ?,
        conditions_notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        payload.title,
        payload.description,
        payload.theme,
        payload.regime,
        payload.minimumGuests,
        payload.basePrice,
        payload.pricePerAdditionalGuest ?? null,
        payload.stock ?? 0,
        payload.highlight ?? null,
        payload.conditions?.orderingNotice ?? 'Commande 5 jours avant la prestation.',
        payload.conditions?.storage ?? 'Conserver entre 0°C et 4°C.',
        payload.conditions?.notes ?? null,
        menuId,
      ]
    );

    // Mettre à jour les images
    run('DELETE FROM menu_images WHERE menu_id = ?', [menuId]);
    const images = payload.images?.length ? payload.images : ['/assets/menu-generic.svg'];
    images.forEach((url, index) => {
      run('INSERT INTO menu_images (menu_id, url, sort_order) VALUES (?, ?, ?)', [menuId, url, index]);
    });
  });

  execute();

  return { success: true, menu: getMenu(menuId) };
}

/**
 * Supprime un menu
 */
export function deleteMenu(menuId) {
  const existing = queryOne('SELECT id FROM menus WHERE id = ?', [menuId]);
  if (!existing) {
    return { success: false, status: 404, message: 'Menu introuvable.' };
  }

  // Vérifier s'il y a des commandes liées
  const orderCount = queryOne('SELECT COUNT(*) as count FROM orders WHERE menu_id = ?', [menuId]);
  if (orderCount && toNumber(orderCount.count) > 0) {
    return {
      success: false,
      status: 400,
      message: 'Impossible de supprimer ce menu car il y a des commandes associées.',
    };
  }

  // Les images et plats seront supprimés automatiquement grâce aux FOREIGN KEY CASCADE
  run('DELETE FROM menus WHERE id = ?', [menuId]);

  return { success: true };
}
