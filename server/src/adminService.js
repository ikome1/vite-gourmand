import { nanoid } from 'nanoid';
import { query, queryOne, run } from './db.js';
import { hashPassword, serializeUser } from './auth.js';
import { sendEmployeeAccountCreatedEmail } from './utils/emailService.js';

/**
 * Crée un compte employé
 */
export async function createEmployeeAccount({ email, password }) {
  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) {
    return { success: false, status: 409, message: 'Un compte existe déjà avec cette adresse e-mail.' };
  }

  const id = nanoid(16);
  run(
    `INSERT INTO users (id, first_name, last_name, email, phone, address, role, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, 'employe', ?)`,
    [id, 'Employé', 'À compléter', email.toLowerCase(), 'Non renseigné', 'Non renseigné', hashPassword(password)]
  );

  const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
  
  // Envoyer un email de notification (sans mot de passe)
  await sendEmployeeAccountCreatedEmail(email);

  return {
    success: true,
    user: serializeUser(user),
    message: 'Compte employé créé. Un email de notification a été envoyé.',
  };
}

/**
 * Désactive un compte employé (ajouter un champ 'active' ou utiliser un rôle spécial)
 * Pour simplifier, on va ajouter un préfixe au role ou créer un champ disabled
 */
export function disableEmployeeAccount(userId) {
  const user = queryOne('SELECT role FROM users WHERE id = ?', [userId]);
  if (!user) {
    return { success: false, status: 404, message: 'Utilisateur introuvable.' };
  }

  if (user.role !== 'employe') {
    return { success: false, status: 400, message: 'Seuls les comptes employés peuvent être désactivés.' };
  }

  // Pour simplifier, on met à jour l'email pour le rendre non utilisable
  // En production, on devrait avoir un champ 'active' ou 'disabled'
  run('UPDATE users SET email = email || ? WHERE id = ?', ['.disabled', userId]);

  return { success: true, message: 'Compte employé désactivé.' };
}

/**
 * Liste tous les employés
 */
export function listEmployees() {
  const employees = query("SELECT * FROM users WHERE role = 'employe' ORDER BY created_at DESC");
  return employees.map(serializeUser);
}

