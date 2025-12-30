import { createHash } from 'node:crypto';
import { db } from './db.js';
import { allergenList, menus, testimonials, users } from './seedData.js';

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function resetTables() {
  const tableNames = [
    'order_history',
    'orders',
    'dish_allergens',
    'menu_dishes',
    'menu_images',
    'dishes',
    'testimonials',
    'menus',
    'users',
    'allergens'
  ];

  db.exec('PRAGMA foreign_keys = OFF;');
  tableNames.forEach((table) => {
    db.exec(`DELETE FROM ${table};`);
  });
  db.exec('PRAGMA foreign_keys = ON;');
}

function seedAllergens() {
  const stmt = db.prepare(
    'INSERT INTO allergens (code, label) VALUES (@code, @label) ON CONFLICT(code) DO UPDATE SET label = excluded.label'
  );
  const insert = db.transaction((rows) => {
    rows.forEach((row) => stmt.run(row));
  });
  insert(allergenList);
}

function seedUsers() {
  const stmt = db.prepare(`
    INSERT INTO users (id, first_name, last_name, email, phone, address, role, password_hash)
    VALUES (@id, @first_name, @last_name, @email, @phone, @address, @role, @password_hash)
    ON CONFLICT(id) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      email = excluded.email,
      phone = excluded.phone,
      address = excluded.address,
      role = excluded.role,
      password_hash = excluded.password_hash
  `);

  const insert = db.transaction((rows) => {
    rows.forEach((row) => stmt.run({ ...row, password_hash: hashPassword(row.password) }));
  });

  insert(users);
}

function seedMenus() {
  const insertMenu = db.prepare(`
    INSERT INTO menus (
      id, title, description, theme, regime, minimum_guests, base_price, price_per_additional_guest,
      stock, highlight, conditions_ordering, conditions_storage, conditions_notes
    ) VALUES (
      @id, @title, @description, @theme, @regime, @minimum_guests, @base_price, @price_per_additional_guest,
      @stock, @highlight, @conditions_ordering, @conditions_storage, @conditions_notes
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      theme = excluded.theme,
      regime = excluded.regime,
      minimum_guests = excluded.minimum_guests,
      base_price = excluded.base_price,
      price_per_additional_guest = excluded.price_per_additional_guest,
      stock = excluded.stock,
      highlight = excluded.highlight,
      conditions_ordering = excluded.conditions_ordering,
      conditions_storage = excluded.conditions_storage,
      conditions_notes = excluded.conditions_notes,
      updated_at = CURRENT_TIMESTAMP
  `);

  const insertImage = db.prepare(
    'INSERT INTO menu_images (menu_id, url, sort_order) VALUES (?, ?, ?)'
  );

  const insertDish = db.prepare(`
    INSERT INTO dishes (id, name, description, course_type, is_signature)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      course_type = excluded.course_type,
      is_signature = excluded.is_signature
  `);

  const linkMenuDish = db.prepare(
    'INSERT OR IGNORE INTO menu_dishes (menu_id, dish_id, sort_order) VALUES (?, ?, ?)' 
  );

  const getAllergenId = db.prepare('SELECT id FROM allergens WHERE code = ?');
  const linkDishAllergen = db.prepare(
    'INSERT OR IGNORE INTO dish_allergens (dish_id, allergen_id) VALUES (?, ?)' 
  );

  const deleteImages = db.prepare('DELETE FROM menu_images WHERE menu_id = ?');
  const deleteLinks = db.prepare('DELETE FROM menu_dishes WHERE menu_id = ?');
  const deleteDishAllergens = db.prepare('DELETE FROM dish_allergens WHERE dish_id = ?');

  const seed = db.transaction((rows) => {
    rows.forEach((menu) => {
      insertMenu.run(menu);
      deleteImages.run(menu.id);
      deleteLinks.run(menu.id);

      menu.images.forEach((url, index) => {
        insertImage.run(menu.id, url, index);
      });

      menu.dishes.forEach((dish, index) => {
        insertDish.run(
          dish.id,
          dish.name,
          dish.description,
          dish.course_type,
          dish.is_signature ? 1 : 0
        );

        deleteDishAllergens.run(dish.id);

        linkMenuDish.run(menu.id, dish.id, index);

        (dish.allergens || []).forEach((code) => {
          const allergen = getAllergenId.get(code);
          if (allergen) {
            linkDishAllergen.run(dish.id, allergen.id);
          }
        });
      });
    });
  });

  seed(rowsWithDefaults(menus));
}

function rowsWithDefaults(rows) {
  return rows.map((row) => ({
    price_per_additional_guest: null,
    highlight: null,
    conditions_notes: null,
    ...row,
  }));
}

function seedTestimonials() {
  const stmt = db.prepare(`
    INSERT INTO testimonials (id, author, event, quote, rating, validated)
    VALUES (@id, @author, @event, @quote, @rating, 1)
    ON CONFLICT(id) DO UPDATE SET
      author = excluded.author,
      event = excluded.event,
      quote = excluded.quote,
      rating = excluded.rating,
      validated = excluded.validated
  `);

  const insert = db.transaction((rows) => {
    rows.forEach((row) => stmt.run(row));
  });

  insert(testimonials);
}

function main() {
  resetTables();
  seedAllergens();
  seedUsers();
  seedMenus();
  seedTestimonials();
  console.log('Base de données initialisée avec succès.');
}

main();
