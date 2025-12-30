/**
 * Service d'envoi d'emails
 * Utilise nodemailer pour l'envoi d'emails
 */

import nodemailer from 'nodemailer';

// Configuration du transporteur email
// En développement, utilisez un service comme Ethereal Email ou configurez SMTP
const createTransporter = () => {
  // Si les variables d'environnement sont configurées, utilisez-les
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // En développement/local : utilisez Ethereal Email ou console.log
  // Pour tester, utilisez https://ethereal.email/
  console.warn('[EMAIL] Configuration SMTP non trouvée. Utilisation du mode simulation (console.log).');
  console.warn('[EMAIL] Pour activer les emails réels, configurez SMTP_HOST, SMTP_USER, SMTP_PASS dans .env');
  
  return null; // Retourne null pour simulation
};

/**
 * Envoie un email de bienvenue lors de l'inscription
 */
export async function sendWelcomeEmail(userEmail, firstName) {
  const transporter = createTransporter();
  
  if (!transporter) {
    // Mode simulation
    console.log(`[EMAIL] ✉️ Bienvenue ${firstName} ! Email envoyé à ${userEmail}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vite-gourmand.fr',
      to: userEmail,
      subject: 'Bienvenue chez Vite & Gourmand !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(120deg, #bf1e2e, #f79f1f); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #bf1e2e; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue ${firstName} !</h1>
            </div>
            <div class="content">
              <p>Merci de vous être inscrit(e) sur <strong>Vite & Gourmand</strong>.</p>
              <p>Vous pouvez maintenant commander nos menus pour vos événements.</p>
              <p>Découvrez notre sélection de menus sur mesure pour vos occasions spéciales.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/menus" class="button">Voir nos menus</a>
              <p>À bientôt,<br><strong>L'équipe Vite & Gourmand</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bienvenue ${firstName} ! Merci de vous être inscrit(e) sur Vite & Gourmand.`,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(userEmail, orderDetails) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`[EMAIL] ✉️ Confirmation de commande #${orderDetails.id} envoyée à ${userEmail}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vite-gourmand.fr',
      to: userEmail,
      subject: `Confirmation de commande #${orderDetails.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(120deg, #bf1e2e, #f79f1f); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .details ul { list-style: none; padding: 0; }
            .details li { padding: 8px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Confirmation de commande</h1>
            </div>
            <div class="content">
              <p>Votre commande a bien été enregistrée.</p>
              <div class="details">
                <h2>Détails de la commande</h2>
                <ul>
                  <li><strong>Menu :</strong> ${orderDetails.menuTitle || 'N/A'}</li>
                  <li><strong>Nombre de convives :</strong> ${orderDetails.guests || 'N/A'}</li>
                  <li><strong>Date de l'événement :</strong> ${orderDetails.eventDate || 'N/A'}</li>
                  ${orderDetails.totalPrice ? `<li><strong>Total :</strong> ${orderDetails.totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</li>` : ''}
                </ul>
              </div>
              <p>Notre équipe vous contactera sous 24h pour finaliser les détails.</p>
              <p>Cordialement,<br><strong>L'équipe Vite & Gourmand</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Confirmation de commande #${orderDetails.id}. Notre équipe vous contactera sous 24h.`,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email de notification de création de compte employé
 */
export async function sendEmployeeAccountCreatedEmail(employeeEmail) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`[EMAIL] ✉️ Notification de création de compte employé envoyée à ${employeeEmail}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vite-gourmand.fr',
      to: employeeEmail,
      subject: 'Compte employé créé - Vite & Gourmand',
      html: `
        <h1>Votre compte employé a été créé</h1>
        <p>Un compte a été créé pour vous sur la plateforme Vite & Gourmand.</p>
        <p><strong>Important :</strong> Votre mot de passe vous sera communiqué séparément par l'administrateur.</p>
        <p>Vous pouvez vous connecter à l'adresse suivante : <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion">${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion</a></p>
        <p>Cordialement,<br>L'équipe Vite & Gourmand</p>
      `,
      text: `Votre compte employé a été créé. Contactez l'administrateur pour obtenir votre mot de passe.`,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email employé:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email pour réinitialiser le mot de passe
 */
export async function sendPasswordResetEmail(userEmail, resetToken) {
  const transporter = createTransporter();
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reinitialiser-mot-de-passe?token=${resetToken}`;
  
  if (!transporter) {
    console.log(`[EMAIL] ✉️ Lien de réinitialisation envoyé à ${userEmail}: ${resetLink}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vite-gourmand.fr',
      to: userEmail,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien suivant pour définir un nouveau mot de passe :</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Ce lien est valable pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <p>Cordialement,<br>L'équipe Vite & Gourmand</p>
      `,
      text: `Réinitialisation de mot de passe. Cliquez sur ce lien : ${resetLink}`,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email de notification quand la commande est terminée
 */
export async function sendOrderCompletedEmail(userEmail, orderId) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`[EMAIL] ✉️ Notification de commande terminée #${orderId} envoyée à ${userEmail}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vite-gourmand.fr',
      to: userEmail,
      subject: `Votre commande #${orderId} est terminée`,
      html: `
        <h1>Commande terminée</h1>
        <p>Votre commande #${orderId} a été livrée avec succès.</p>
        <p>Nous espérons que vous avez apprécié nos services.</p>
        <p>N'hésitez pas à nous laisser un avis sur votre expérience :</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mes-commandes/${orderId}/avis">Laisser un avis</a></p>
        <p>Merci pour votre confiance,<br>L'équipe Vite & Gourmand</p>
      `,
      text: `Votre commande #${orderId} est terminée. Merci de nous laisser un avis.`,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de commande terminée:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email de demande de retour de matériel
 */
export async function sendEquipmentReturnReminderEmail(userEmail, orderId) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`[EMAIL] ✉️ Rappel de retour de matériel pour commande #${orderId} envoyé à ${userEmail}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vite-gourmand.fr',
      to: userEmail,
      subject: `Rappel : Retour de matériel - Commande #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(120deg, #f79f1f, #bf1e2e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .contact-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .contact-info ul { list-style: none; padding: 0; }
            .contact-info li { padding: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Retour de matériel</h1>
            </div>
            <div class="content">
              <p>Votre commande <strong>#${orderId}</strong> nécessite le retour de matériel prêté.</p>
              <div class="alert">
                <p><strong>Important :</strong> Vous devez restituer le matériel sous 10 jours ouvrés.</p>
                <p>En cas de non-restitution, des frais de <strong>600€</strong> seront appliqués (conformément aux Conditions Générales de Vente).</p>
              </div>
              <div class="contact-info">
                <p>Pour organiser le retour, veuillez nous contacter :</p>
                <ul>
                  <li><strong>Email :</strong> contact@vite-gourmand.fr</li>
                  <li><strong>Téléphone :</strong> 05 56 00 00 00</li>
                </ul>
              </div>
              <p>Cordialement,<br><strong>L'équipe Vite & Gourmand</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Retour de matériel requis pour la commande #${orderId}. Contactez-nous pour organiser le retour.`,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de retour matériel:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie un email de contact (formulaire de contact)
 */
export async function sendContactEmail(contactDetails) {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'contact@vite-gourmand.fr';
  
  if (!transporter) {
    console.log(`[EMAIL] ✉️ Demande de contact de ${contactDetails.name} (${contactDetails.email})`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vite-gourmand.fr',
      to: adminEmail,
      replyTo: contactDetails.email,
      subject: `Nouvelle demande de contact : ${contactDetails.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(120deg, #bf1e2e, #f79f1f); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #bf1e2e; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouvelle demande de contact</h1>
            </div>
            <div class="content">
              <h2>De : ${contactDetails.name}</h2>
              <p><strong>Email :</strong> ${contactDetails.email}</p>
              <h3>Sujet : ${contactDetails.title}</h3>
              <div class="message-box">
                <p style="white-space: pre-wrap;">${contactDetails.message}</p>
              </div>
              <div class="footer">
                <p><em>Email envoyé depuis le formulaire de contact du site Vite & Gourmand</em></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Nouvelle demande de contact de ${contactDetails.name} (${contactDetails.email})\n\nSujet: ${contactDetails.title}\n\n${contactDetails.message}`,
    });
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de contact:', error);
    return { success: false, error: error.message };
  }
}
