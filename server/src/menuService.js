import { nanoid } from 'nanoid';
import { query, queryOne, run, transaction } from './db.js';

function buildFilterClause(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.theme && filters.theme !== 'Tous') {
    clauses.push('m.theme = ?');
    params.push(filters.theme);
  }

  if (filters.regime && filters.regime !== 'Tous') {
    clauses.push('m.regime = ?');
    params.push(filters.regime);
  }

  if (filters.maxPrice) {
    clauses.push('m.base_price <= ?');
    params.push(Number(filters.maxPrice));
  }

  if (filters.priceMin) {
    clauses.push('m.base_price >= ?');
    params.push(Number(filters.priceMin));
  }

  if (filters.priceMax) {
    clauses.push('m.base_price <= ?');
    params.push(Number(filters.priceMax));
  }

  if (filters.minGuests) {
    clauses.push('m.minimum_guests >= ?');
    params.push(Number(filters.minGuests));
  }

  if (filters.search) {
    clauses.push(`LOWER(m.title || ' ' || m.description || ' ' || IFNULL(m.highlight, '')) LIKE ?`);
    params.push(`%${filters.search.toLowerCase()}%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

export function listMenus(filters) {
  const { where, params } = buildFilterClause(filters);
  const rows = query(
    `SELECT m.*, (
        SELECT json_group_array(url) FROM (
          SELECT url FROM menu_images WHERE menu_id = m.id ORDER BY sort_order
        )
      ) AS images
     FROM menus m
     ${where}
     ORDER BY m.created_at DESC`,
    params
  );

  return rows.map(mapMenuRow);
}

export function getMenu(menuId) {
  const row = queryOne(
    `SELECT m.*, (
        SELECT json_group_array(url) FROM (
          SELECT url FROM menu_images WHERE menu_id = m.id ORDER BY sort_order
        )
      ) AS images
     FROM menus m WHERE m.id = ?`,
    [menuId]
  );
  if (!row) return null;
  const menu = mapMenuRow(row);
  menu.courses = getMenuCourses(menuId);
  return menu;
}

function toNumber(value) {
  return typeof value === 'bigint' ? Number(value) : value;
}

function mapMenuRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    theme: row.theme,
    regime: row.regime,
    minimumGuests: toNumber(row.minimum_guests),
    basePrice: Number(row.base_price),
    pricePerAdditionalGuest:
      row.price_per_additional_guest !== null && row.price_per_additional_guest !== undefined
        ? Number(row.price_per_additional_guest)
        : null,
    stock: toNumber(row.stock),
    highlight: row.highlight,
    conditions: {
      orderingNotice: row.conditions_ordering,
      storage: row.conditions_storage,
      notes: row.conditions_notes ?? undefined,
    },
    images: row.images ? JSON.parse(row.images) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getMenuCourses(menuId) {
  const rows = query(
    `SELECT d.*, COALESCE(json_group_array(a.label), json('[]')) AS allergens
     FROM menu_dishes md
     JOIN dishes d ON d.id = md.dish_id
     LEFT JOIN dish_allergens da ON da.dish_id = d.id
     LEFT JOIN allergens a ON a.id = da.allergen_id
     WHERE md.menu_id = ?
     GROUP BY d.id
     ORDER BY md.sort_order`,
    [menuId]
  );

  const base = { entrees: [], plats: [], desserts: [] };
  rows.forEach((row) => {
    const dish = {
      id: String(row.id),
      name: row.name,
      description: row.description,
      allergens: row.allergens ? JSON.parse(row.allergens) : [],
      isSignature: Boolean(row.is_signature),
    };
    if (row.course_type === 'Entrée') {
      base.entrees.push(dish);
    } else if (row.course_type === 'Plat') {
      base.plats.push(dish);
    } else {
      base.desserts.push(dish);
    }
  });
  return base;
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
