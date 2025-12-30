import { createHash } from 'node:crypto';
import { nanoid } from 'nanoid';
import { queryOne, run } from './db.js';

const sessions = new Map();

export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export function createSession(userId) {
  const token = nanoid(32);
  sessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function getUserFromToken(token) {
  const session = sessions.get(token);
  if (!session) return null;
  return queryOne('SELECT * FROM users WHERE id = ?', [session.userId]);
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice('Bearer '.length);
  const user = getUserFromToken(token);
  if (!user) {
    req.user = null;
    return next();
  }

  req.user = user;
  req.token = token;
  next();
}

export function registerUser({ firstName, lastName, email, phone, address, password }) {
  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) {
    return { success: false, status: 409, message: 'Un compte existe déjà avec cette adresse e-mail.' };
  }

  const id = nanoid(16);
  run(
    `INSERT INTO users (id, first_name, last_name, email, phone, address, role, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, 'utilisateur', ?)` ,
    [id, firstName, lastName, email.toLowerCase(), phone, address, hashPassword(password)]
  );

  const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
  const token = createSession(id);
  return { success: true, user: serializeUser(user), token };
}

export function loginUser({ email, password }) {
  const user = queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) {
    return { success: false, status: 401, message: 'Identifiants invalides.' };
  }

  if (user.password_hash !== hashPassword(password)) {
    return { success: false, status: 401, message: 'Identifiants invalides.' };
  }

  const token = createSession(user.id);
  return { success: true, user: serializeUser(user), token };
}

export function serializeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    role: row.role,
    createdAt: row.created_at,
  };
}
