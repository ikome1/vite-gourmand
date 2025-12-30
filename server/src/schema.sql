PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('utilisateur', 'employe', 'administrateur')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,
  regime TEXT NOT NULL,
  minimum_guests INTEGER NOT NULL,
  base_price REAL NOT NULL,
  price_per_additional_guest REAL,
  stock INTEGER NOT NULL,
  highlight TEXT,
  conditions_ordering TEXT NOT NULL,
  conditions_storage TEXT NOT NULL,
  conditions_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  course_type TEXT NOT NULL CHECK (course_type IN ('Entrée', 'Plat', 'Dessert')),
  is_signature INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_dishes (
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  dish_id TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (menu_id, dish_id)
);

CREATE TABLE IF NOT EXISTS allergens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dish_allergens (
  dish_id TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  allergen_id INTEGER NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  PRIMARY KEY (dish_id, allergen_id)
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  event TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  validated INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  guests INTEGER NOT NULL,
  event_date TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW IF NOT EXISTS menu_view AS
SELECT
  m.id,
  m.title,
  m.description,
  m.theme,
  m.regime,
  m.minimum_guests,
  m.base_price,
  m.price_per_additional_guest,
  m.stock,
  m.highlight,
  m.conditions_ordering,
  m.conditions_storage,
  m.conditions_notes,
  m.created_at,
  m.updated_at,
  (
    SELECT json_group_array(url) FROM (
      SELECT url FROM menu_images WHERE menu_id = m.id ORDER BY sort_order
    )
  ) AS images
FROM menus m;
