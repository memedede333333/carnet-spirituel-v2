import 'server-only';
import nodemailer from 'nodemailer';

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Vérifier la configuration au démarrage (optionnel, pour debug)
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Erreur configuration email:', error);
    } else {
      console.log('✅ Serveur email prêt');
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email via Gmail
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Carnet Spirituel" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback texte brut
    });

    console.log('📧 Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return { success: false, error };
  }
}

/**
 * Email de notification à l'auteur d'un fioretto
 */
export async function sendFiorettoNotification(
  userEmail: string,
  userName: string,
  status: 'approuve' | 'refuse' | 'modifie',
  moderatorMessage?: string
) {
  const statusMessages = {
    approuve: {
      subject: '✅ Votre fioretto a été approuvé',
      title: 'Votre fioretto a été approuvé !',
      message: 'Votre partage est maintenant visible dans le Jardin des Fioretti. Merci pour votre témoignage !',
      color: '#10B981',
    },
    refuse: {
      subject: '❌ Votre fioretto n\'a pas été approuvé',
      title: 'Votre fioretto n\'a pas été approuvé',
      message: 'Après relecture, nous ne pouvons pas publier ce fioretto. N\'hésitez pas à nous contacter si vous avez des questions.',
      color: '#EF4444',
    },
    modifie: {
      subject: '✏️ Votre fioretto a été modifié et approuvé',
      title: 'Votre fioretto a été modifié',
      message: 'Votre fioretto a été légèrement modifié par notre équipe de modération et est maintenant publié.',
      color: '#F59E0B',
    },
  };

  const config = statusMessages[status];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${config.color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .message-box { background: white; padding: 20px; border-left: 4px solid ${config.color}; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background: ${config.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🌸 ${config.title}</h1>
        </div>
        <div class="content">
          <p>Bonjour ${userName},</p>
          <p>${config.message}</p>
          
          ${moderatorMessage ? `
            <div class="message-box">
              <strong>💬 Message du modérateur :</strong>
              <p style="margin: 10px 0 0 0;">${moderatorMessage}</p>
            </div>
          ` : ''}
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mes-fioretti" class="button">
              Voir mes fioretti
            </a>
          </p>
          
          <div class="footer">
            <p>Carnet Spirituel - Cultivez le beau et saint</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/charte" style="color: #6b7280;">Charte du site</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: config.subject,
    html,
  });
}

/**
 * Email aux modérateurs lors d'une nouvelle soumission
 */
export async function sendModeratorNotification(
  moderatorEmail: string,
  moderatorName: string,
  fiorettoData: {
    fiorettoType: string;
    authorName: string;
    authorEmail: string;
    content: string;
    isAnonymous: boolean;
    submittedAt: Date;
  }
) {
  const typeLabels: Record<string, string> = {
    grace: '✨ Grâce',
    priere: '🙏 Prière',
    ecriture: '📖 Écriture',
    parole: '🕊️ Parole',
    rencontre: '🤝 Rencontre',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #e5e7eb; }
        .preview { background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; border-radius: 4px; font-style: italic; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔔 Nouveau fioretto à modérer</h1>
        </div>
        <div class="content">
          <p>Bonjour ${moderatorName},</p>
          <p>Un nouveau fioretto attend votre validation :</p>
          
          <div class="info-box">
            <p><strong>📝 Type :</strong> ${typeLabels[fiorettoData.fiorettoType] || fiorettoData.fiorettoType}</p>
            <p><strong>👤 Auteur :</strong> ${fiorettoData.authorName} (${fiorettoData.authorEmail})</p>
            <p><strong>📅 Soumis le :</strong> ${fiorettoData.submittedAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}</p>
            <p><strong>🎭 Anonymat demandé :</strong> ${fiorettoData.isAnonymous ? '✅ Oui' : '❌ Non'}</p>
          </div>
          
          <div class="preview">
            <strong>Aperçu du contenu :</strong>
            <p>« ${fiorettoData.content.substring(0, 200)}${fiorettoData.content.length > 200 ? '...' : ''} »</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/moderation" class="button">
              👉 Accéder à la modération
            </a>
          </p>
          
          <div class="footer">
            <p>Carnet Spirituel - Modération</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: moderatorEmail,
    subject: `🔔 Nouveau fioretto à modérer (${typeLabels[fiorettoData.fiorettoType]})`,
    html,
  });
}
