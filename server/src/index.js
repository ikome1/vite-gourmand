import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { authenticate, destroySession, loginUser, registerUser, serializeUser } from './auth.js';
import { createMenu, getMenu, listMenus, updateMenuStock, updateMenu, deleteMenu } from './menuService.js';
import { createOrder, getOrderById, getOrderHistory, updateOrderStatus, cancelOrder, updateOrder } from './orderService.js';
import { query, queryOne, run } from './db.js';
import { sendOrderConfirmationEmail, sendPasswordResetEmail, sendContactEmail } from './utils/emailService.js';
import { createEmployeeAccount, disableEmployeeAccount, listEmployees } from './adminService.js';
import { getOrdersByMenu, getRevenueByPeriod } from './db/mongodb.js';

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

app.patch('/api/menus/:id', (req, res) => {
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

  const result = updateMenu(req.params.id, parsed.data);
  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.json({ data: result.menu, message: 'Menu mis à jour.' });
});

app.delete('/api/menus/:id', (req, res) => {
  if (!req.user || !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const result = deleteMenu(req.params.id);
  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.json({ message: 'Menu supprimé.' });
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

app.get('/api/testimonials/pending', (req, res) => {
  if (!req.user || !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const rows = query('SELECT * FROM testimonials WHERE pending_validation = 1 OR validated = 0 ORDER BY id');
  res.json({ data: rows.map((row) => ({
    id: row.id,
    name: row.author,
    event: row.event,
    quote: row.quote,
    rating: row.rating,
    orderId: row.order_id ?? undefined,
    pendingValidation: Boolean(row.pending_validation),
  })) });
});

const validateTestimonialSchema = z.object({
  validated: z.boolean(),
});

app.patch('/api/testimonials/:id/validate', (req, res) => {
  if (!req.user || !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const parseResult = validateTestimonialSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.' });
  }

  run(
    'UPDATE testimonials SET validated = ?, pending_validation = 0 WHERE id = ?',
    [parseResult.data.validated ? 1 : 0, req.params.id]
  );

  res.json({ message: parseResult.data.validated ? 'Avis validé.' : 'Avis refusé.' });
});

const createTestimonialSchema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  quote: z.string().min(10),
  event: z.string().min(1),
});

app.post('/api/testimonials', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const parseResult = createTestimonialSchema.safeParse({
    ...req.body,
    rating: Number(req.body.rating),
  });

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  // Vérifier que la commande appartient à l'utilisateur et est terminée
  const order = queryOne(
    'SELECT status, user_id FROM orders WHERE id = ?',
    [parseResult.data.orderId]
  );

  if (!order) {
    return res.status(404).json({ message: 'Commande introuvable.' });
  }

  if (order.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  if (order.status !== 'terminee') {
    return res.status(400).json({ message: 'Vous ne pouvez donner un avis que pour une commande terminée.' });
  }

  // Vérifier qu'il n'y a pas déjà un avis pour cette commande
  const existing = queryOne('SELECT id FROM testimonials WHERE order_id = ?', [parseResult.data.orderId]);
  if (existing) {
    return res.status(409).json({ message: 'Un avis existe déjà pour cette commande.' });
  }

  const testimonialId = nanoid(16);
  const user = queryOne('SELECT first_name, last_name FROM users WHERE id = ?', [req.user.id]);

  run(
    `INSERT INTO testimonials (id, author, event, quote, rating, order_id, pending_validation, validated)
     VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
    [
      testimonialId,
      `${user.first_name} ${user.last_name}`,
      parseResult.data.event,
      parseResult.data.quote,
      parseResult.data.rating,
      parseResult.data.orderId,
    ]
  );

  res.status(201).json({ message: 'Votre avis a été soumis et sera validé par notre équipe.' });
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

app.post('/api/auth/register', async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const result = await registerUser(parseResult.data);
  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.status(201).json({ user: result.user, token: result.token, message: 'Inscription réussie. Un email de bienvenue vous a été envoyé.' });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

app.post('/api/auth/login', (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.' });
  }

  const result = loginUser(parseResult.data);
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

app.post('/api/auth/reset-password', async (req, res) => {
  const parseResult = resetSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Email invalide.' });
  }
  const user = queryOne('SELECT id, email FROM users WHERE email = ?', [parseResult.data.email.toLowerCase()]);
  if (!user) {
    return res.status(404).json({ message: 'Aucun compte pour cet email.' });
  }
  
  // Générer un token de réinitialisation (en production, stocker dans la base avec expiration)
  const resetToken = nanoid(32);
  
  // Envoyer l'email avec le lien de réinitialisation
  await sendPasswordResetEmail(user.email, resetToken);
  
  res.json({ message: 'Un lien de réinitialisation vous a été envoyé par email.' });
});

const orderSchema = z.object({
  menuId: z.string(),
  eventDate: z.string().min(4),
  guests: z.number().int().min(1),
  deliveryAddress: z.string().min(5),
  notes: z.string().optional(),
});

app.post('/api/orders', async (req, res) => {
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

  // Envoyer un email de confirmation
  const user = queryOne('SELECT email, first_name FROM users WHERE id = ?', [req.user.id]);
  if (user) {
    await sendOrderConfirmationEmail(user.email, result.order);
  }

  res.status(201).json({ order: result.order, message: 'Commande créée. Un email de confirmation vous a été envoyé.' });
});

app.get('/api/orders', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  // Si admin ou employé, peut voir toutes les commandes (avec filtres optionnels)
  let sql = `SELECT o.*, m.title AS menu_title FROM orders o JOIN menus m ON m.id = o.menu_id`;
  let params = [];
  let conditions = [];

  if (!['administrateur', 'employe'].includes(req.user.role)) {
    // Utilisateur normal : seulement ses commandes
    conditions.push('o.user_id = ?');
    params.push(req.user.id);
  } else {
    // Admin/Employé : filtres optionnels
    if (req.query.userId) {
      conditions.push('o.user_id = ?');
      params.push(req.query.userId);
    }
    if (req.query.status) {
      conditions.push('o.status = ?');
      params.push(req.query.status);
    }
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY o.created_at DESC';

  const orders = query(sql, params).map((order) => ({
    id: order.id,
    menuId: order.menu_id,
    menuTitle: order.menu_title,
    guests: order.guests,
    eventDate: order.event_date,
    deliveryAddress: order.delivery_address,
    notes: order.notes ?? undefined,
    status: order.status,
    menuPrice: order.menu_price ? Number(order.menu_price) : null,
    discountAmount: order.discount_amount ? Number(order.discount_amount) : 0,
    deliveryPrice: order.delivery_price ? Number(order.delivery_price) : 0,
    totalPrice: order.total_price ? Number(order.total_price) : null,
    createdAt: order.created_at,
  }));

  res.json({ data: orders });
});

app.get('/api/orders/:id', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const order = getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Commande introuvable.' });
  }

  // Vérifier les permissions
  if (order.userId !== req.user.id && !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  res.json({ data: order });
});

app.get('/api/orders/:id/history', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const order = getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Commande introuvable.' });
  }

  // Vérifier les permissions
  if (order.userId !== req.user.id && !['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const history = getOrderHistory(req.params.id);
  res.json({ data: history });
});

const updateOrderSchema = z.object({
  guests: z.number().int().min(1).optional(),
  eventDate: z.string().optional(),
  deliveryAddress: z.string().min(5).optional(),
  notes: z.string().optional(),
});

app.patch('/api/orders/:id', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const parseResult = updateOrderSchema.safeParse({
    ...req.body,
    guests: req.body.guests !== undefined ? Number(req.body.guests) : undefined,
  });

  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const result = updateOrder(req.params.id, req.user.id, parseResult.data);
  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.json({ data: result.order, message: 'Commande mise à jour.' });
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['en_attente', 'accepte', 'en_preparation', 'en_cours_de_livraison', 'livre', 'en_attente_retour_materiel', 'terminee', 'annulee']),
  comment: z.string().optional(),
});

app.patch('/api/orders/:id/status', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  if (!['administrateur', 'employe'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const parseResult = updateOrderStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const result = await updateOrderStatus(req.params.id, parseResult.data.status, parseResult.data.comment, req.user.id);

  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.json({ message: 'Statut mis à jour.' });
});

app.delete('/api/orders/:id', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const reason = req.body.reason || 'Commande annulée par l\'utilisateur.';
  const result = cancelOrder(req.params.id, req.user.id, reason);

  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.json({ message: 'Commande annulée.' });
});

// Routes Admin
const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial'),
});

app.post('/api/admin/employees', async (req, res) => {
  if (!req.user || req.user.role !== 'administrateur') {
    return res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' });
  }

  const parseResult = createEmployeeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const result = await createEmployeeAccount(parseResult.data);

  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.status(201).json({ user: result.user, message: result.message });
});

app.get('/api/admin/employees', (req, res) => {
  if (!req.user || req.user.role !== 'administrateur') {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const employees = listEmployees();
  res.json({ data: employees });
});

app.patch('/api/admin/employees/:id/disable', (req, res) => {
  if (!req.user || req.user.role !== 'administrateur') {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const result = disableEmployeeAccount(req.params.id);

  if (!result.success) {
    return res.status(result.status ?? 400).json({ message: result.message });
  }

  res.json({ message: result.message });
});

// Statistiques admin
app.get('/api/admin/statistics/orders-by-menu', async (req, res) => {
  if (!req.user || req.user.role !== 'administrateur') {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const stats = await getOrdersByMenu();
  res.json({ data: stats });
});

app.get('/api/admin/statistics/revenue', async (req, res) => {
  if (!req.user || req.user.role !== 'administrateur') {
    return res.status(403).json({ message: 'Accès refusé.' });
  }

  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;
  const menuId = req.query.menuId || null;
  
  const revenue = await getRevenueByPeriod(startDate, endDate, menuId);
  res.json({ data: revenue });
});

// Mise à jour profil utilisateur
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  address: z.string().min(5).optional(),
});

app.patch('/api/users/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const parseResult = updateProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const updates = {};
  if (parseResult.data.firstName) updates.first_name = parseResult.data.firstName;
  if (parseResult.data.lastName) updates.last_name = parseResult.data.lastName;
  if (parseResult.data.phone) updates.phone = parseResult.data.phone;
  if (parseResult.data.address) updates.address = parseResult.data.address;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Aucune donnée à mettre à jour.' });
  }

  const setClause = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), req.user.id];

  run(`UPDATE users SET ${setClause} WHERE id = ?`, values);

  const updatedUser = queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json({ user: serializeUser(updatedUser), message: 'Profil mis à jour.' });
});

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  title: z.string().min(1),
  message: z.string().min(10),
});

app.post('/api/contact', async (req, res) => {
  const parseResult = contactSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Données invalides.', details: parseResult.error.issues });
  }

  const contactId = nanoid(16);

  // Sauvegarder la demande de contact
  run(
    `INSERT INTO contact_requests (id, name, email, title, message)
     VALUES (?, ?, ?, ?, ?)`,
    [contactId, parseResult.data.name, parseResult.data.email.toLowerCase(), parseResult.data.title, parseResult.data.message]
  );

  // Envoyer un email à l'entreprise
  await sendContactEmail(parseResult.data);

  res.status(201).json({ message: 'Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.' });
});

app.listen(PORT, () => {
  console.log(`API Vite & Gourmand démarrée sur http://localhost:${PORT}`);
});
