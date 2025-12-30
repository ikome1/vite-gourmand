import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { authenticate, destroySession, loginUser, registerUser, serializeUser } from './auth.js';
import { createMenu, getMenu, listMenus, updateMenuStock } from './menuService.js';
import { createOrder } from './orderService.js';
import { query, queryOne } from './db.js';
import { connectMongoDB, logActivity } from './db/mongodb.js';

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

app.use(
  cors({
    origin: ORIGINS.map((origin) => origin.trim()),
    credentials: true,
  })
);
app.use(express.json());
app.use(authenticate);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/menus', (req, res) => {
  const filters = {
    theme: req.query.theme,
    regime: req.query.regime,
    maxPrice: req.query.maxPrice,
    priceMin: req.query.priceMin,
    priceMax: req.query.priceMax,
    minGuests: req.query.minGuests,
    search: req.query.search,
  };
  const data = listMenus(filters);
  res.json({ data });
});

app.get('/api/menus/:id', (req, res) => {
  const menu = getMenu(req.params.id);
  if (!menu) {
    return res.status(404).json({ message: 'Menu introuvable.' });
  }
  res.json({ data: menu });
});

const newMenuSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  theme: z.string().min(2),
  regime: z.string().min(2),
  minimumGuests: z.number().int().min(1),
  basePrice: z.number().min(0),
  pricePerAdditionalGuest: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  highlight: z.string().optional(),
  images: z.array(z.string().min(1)).max(6).optional(),
  conditions: z
    .object({
      orderingNotice: z.string().min(5).optional(),
      storage: z.string().min(5).optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

app.post('/api/menus', (req, res) => {
  if (!req.user || !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const parsed = newMenuSchema.safeParse({
    ...req.body,
    minimumGuests: Number(req.body.minimumGuests),
    basePrice: Number(req.body.basePrice),
    pricePerAdditionalGuest: req.body.pricePerAdditionalGuest !== undefined ? Number(req.body.pricePerAdditionalGuest) : undefined,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
  });

  if (!parsed.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parsed.error.issues });
  }

  const menu = createMenu(parsed.data);
  res.status(201).json({ data: menu, message: 'Menu créé.' });
});

const stockSchema = z.object({ stock: z.number().int().min(0) });

app.patch('/api/menus/:id/stock', (req, res) => {
  if (!req.user || !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const parsed = stockSchema.safeParse({ stock: Number(req.body.stock) });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Stock invalide.' });
  }

  const updated = updateMenuStock(req.params.id, parsed.data.stock);
  if (!updated) {
    return res.status(404).json({ message: 'Menu introuvable.' });
  }

  res.json({ message: 'Stock mis à jour.' });
});

app.get('/api/testimonials', (_req, res) => {
  const rows = query('SELECT * FROM testimonials WHERE validated = 1 ORDER BY id');
  res.json({ data: rows.map((row) => ({
    id: row.id,
    name: row.author,
    event: row.event,
    quote: row.quote,
    rating: row.rating,
  })) });
});

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(5),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial'),
});

app.post('/api/auth/register', (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const result = registerUser(parseResult.data);
  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.status(201).json({ user: result.user, token: result.token, message: 'Inscription réussie.' });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

app.post('/api/auth/login', async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.' });
  }

  const result = await loginUser(parseResult.data);
  if (!result.success) {
    return res.status(result.status ?? 401).json({ message: result.message });
  }

  res.json({ user: result.user, token: result.token, message: 'Connexion réussie.' });
});

app.post('/api/auth/logout', (req, res) => {
  if (!req.token) {
    return res.status(204).end();
  }
  destroySession(req.token);
  res.status(204).end();
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié.' });
  }
  res.json({ user: serializeUser(req.user) });
});

const resetSchema = z.object({ email: z.string().email() });

app.post('/api/auth/reset-password', (req, res) => {
  const parseResult = resetSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Email invalide.' });
  }
  const user = queryOne('SELECT id FROM users WHERE email = ?', [parseResult.data.email.toLowerCase()]);
  if (!user) {
    return res.status(404).json({ message: 'Aucun compte pour cet email.' });
  }
  res.json({ message: 'Un lien de réinitialisation vous a été envoyé (simulation).' });
});

const orderSchema = z.object({
  menuId: z.string(),
  eventDate: z.string().min(4),
  guests: z.number().int().min(1),
  deliveryAddress: z.string().min(5),
  notes: z.string().optional(),
});

app.post('/api/orders', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const parseResult = orderSchema.safeParse({
    ...req.body,
    guests: Number(req.body.guests),
  });

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const result = createOrder({
    userId: req.user.id,
    menuId: parseResult.data.menuId,
    guests: parseResult.data.guests,
    eventDate: parseResult.data.eventDate,
    deliveryAddress: parseResult.data.deliveryAddress,
    notes: parseResult.data.notes,
  });

  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.status(201).json({ order: result.order, message: 'Commande créée. Julie & José vous contacteront sous 24h.' });
});

app.get('/api/orders', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const orders = query(
    `SELECT o.*, m.title AS menu_title FROM orders o
     JOIN menus m ON m.id = o.menu_id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [req.user.id]
  ).map((order) => ({
    id: order.id,
    menuId: order.menu_id,
    menuTitle: order.menu_title,
    guests: order.guests,
    eventDate: order.event_date,
    deliveryAddress: order.delivery_address,
    notes: order.notes ?? undefined,
    status: order.status,
    createdAt: order.created_at,
  }));

  res.json({ data: orders });
});

// Initialiser MongoDB (optionnel, ne bloque pas si non disponible)
connectMongoDB().catch(() => {
  console.log('MongoDB optionnel - utilisation de SQLite uniquement');
});

// Route pour les logs d'activité (NoSQL)
app.get('/api/logs', async (req, res) => {
  if (!req.user || !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  try {
    const { getActivityLogs } = await import('./db/mongodb.js');
    const logs = await getActivityLogs({}, 50);
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des logs.' });
  }
});

// Middleware pour logger les actions importantes
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.user) {
    logActivity({
      userId: req.user.id,
      action: req.method,
      endpoint: req.path,
      userRole: req.user.role,
    }).catch(() => {}); // Ne pas bloquer si MongoDB n'est pas disponible
  }
  next();
});

app.listen(PORT, () => {
  console.log(`API Vite & Gourmand démarrée sur http://localhost:${PORT}`);
});
