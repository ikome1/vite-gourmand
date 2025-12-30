-- Migration: Ajout des champs de prix et livraison aux commandes
-- Date: 2024-12-26

-- Ajouter les colonnes pour stocker le prix calculé de la commande
ALTER TABLE orders ADD COLUMN menu_price REAL;
ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_price REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN total_price REAL;

-- Ajouter colonne pour le prêt de matériel
ALTER TABLE orders ADD COLUMN equipment_loan INTEGER DEFAULT 0;

-- Ajouter colonne pour les contacts utilisateurs
CREATE TABLE IF NOT EXISTS contact_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  handled INTEGER DEFAULT 0
);

-- Ajouter colonne pour les avis liés aux commandes
ALTER TABLE testimonials ADD COLUMN order_id TEXT REFERENCES orders(id);
ALTER TABLE testimonials ADD COLUMN pending_validation INTEGER DEFAULT 0;

