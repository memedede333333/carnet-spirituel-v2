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

// Configuration des types de fioretti (même palette que le site)
const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  grace: { icon: '✨', label: 'Grâce', color: '#78350F', bgColor: '#FEF3C7' },
  priere: { icon: '🙏', label: 'Prière', color: '#4338CA', bgColor: '#EDE9FE' },
  ecriture: { icon: '📖', label: 'Écriture', color: '#065F46', bgColor: '#D1FAE5' },
  parole: { icon: '🕊️', label: 'Parole', color: '#0369A1', bgColor: '#E0F2FE' },
  rencontre: { icon: '🤝', label: 'Rencontre', color: '#BE123C', bgColor: '#FFE4E6' },
};

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
  moderatorMessage?: string,
  fiorettoContent?: { type: string; text: string }
) {
  const statusMessages = {
    approuve: {
      subject: '✅ Votre partage a été approuvé',
      title: 'Votre partage a été approuvé !',
      message: 'Votre témoignage est maintenant visible dans le Jardin des Fioretti. Merci pour votre partage !',
      color: '#10B981',
      emoji: '🌸',
    },
    refuse: {
      subject: '❌ Votre partage n\'a pas été approuvé',
      title: 'Votre partage n\'a pas été approuvé',
      message: 'Après relecture, nous ne pouvons pas publier ce témoignage. N\'hésitez pas à nous contacter si vous avez des questions.',
      color: '#EF4444',
      emoji: '💭',
    },
    modifie: {
      subject: '✏️ Votre partage a été modifié et approuvé',
      title: 'Votre partage a été modifié',
      message: 'Votre témoignage a été légèrement modifié par notre équipe de modération et est maintenant publié.',
      color: '#F59E0B',
      emoji: '✨',
    },
  };

  const config = statusMessages[status];
  const typeConfig = fiorettoContent ? TYPE_CONFIG[fiorettoContent.type] || TYPE_CONFIG.grace : null;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', -apple-system, sans-serif; 
          line-height: 1.6; 
          color: #1f2345; 
          background: #f9f9f9;
          margin: 0;
          padding: 20px;
        }
        .container { 
          max-width: 560px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header { 
          background: ${config.color}; 
          color: white; 
          padding: 24px 32px; 
          text-align: center; 
        }
        .header h1 {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }
        .content { 
          padding: 32px; 
        }
        .greeting {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 16px;
        }
        .message {
          font-size: 1rem;
          color: #1f2345;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        
        /* Fioretto Card */
        .fioretto-card {
          background: #fafafa;
          border-radius: 8px;
          border: 1px solid #e9e8f0;
          overflow: hidden;
          margin: 20px 0;
        }
        .fioretto-header {
          background: ${typeConfig?.bgColor || '#FEF3C7'};
          padding: 12px 16px;
          border-bottom: 1px solid ${typeConfig?.color || '#78350F'}30;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .fioretto-header .type {
          font-weight: 600;
          font-size: 0.8rem;
          color: ${typeConfig?.color || '#78350F'};
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .fioretto-content {
          padding: 16px;
          font-size: 0.95rem;
          line-height: 1.7;
          color: #4b5563;
          font-family: 'Crimson Text', Georgia, serif;
        }
        
        /* Message modérateur */
        .moderator-message { 
          background: #fffbeb; 
          padding: 16px; 
          border-left: 3px solid ${config.color}; 
          margin: 20px 0; 
          border-radius: 4px; 
        }
        .moderator-message strong {
          color: #92400e;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .moderator-message p {
          margin: 8px 0 0 0;
          color: #78350f;
          font-size: 0.9rem;
        }
        
        .button { 
          display: inline-block; 
          background: ${config.color}; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 500;
          font-size: 0.9rem;
          margin: 16px 0;
        }
        .footer { 
          text-align: center; 
          padding: 24px; 
          background: #fafafa;
          border-top: 1px solid #e9e8f0;
          font-size: 0.85rem;
          color: #9ca3af;
        }
        .footer a {
          color: #6b7280;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.emoji} ${config.title}</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Bonjour ${userName},</p>
          <p class="message">${config.message}</p>
          
          ${fiorettoContent ? `
            <div class="fioretto-card">
              <div class="fioretto-header">
                <span>${typeConfig?.icon}</span>
                <span class="type">${typeConfig?.label}</span>
              </div>
              <div class="fioretto-content">${fiorettoContent.text}</div>
            </div>
          ` : ''}
          
          ${moderatorMessage ? `
            <div class="moderator-message">
              <strong>💬 Message du modérateur</strong>
              <p>${moderatorMessage}</p>
            </div>
          ` : ''}
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mes-fioretti" class="button">
              Voir mes partages
            </a>
          </center>
        </div>
        
        <div class="footer">
          <strong>Carnet Spirituel</strong> · Cultivez la présence de Dieu dans vos vies
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/charte">Charte du site</a>
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
  const typeConfig = TYPE_CONFIG[fiorettoData.fiorettoType] || TYPE_CONFIG.grace;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #1f2345; 
          background: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
        }
        .header { 
          background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%); 
          color: white; 
          padding: 24px 32px; 
          text-align: center; 
        }
        .header h1 {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.2;
        }
        .header .emoji {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          display: block;
        }
        .content { 
          padding: 2rem; 
        }
        .greeting {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .message {
          font-size: 1.1rem;
          color: #1f2345;
          margin-bottom: 1.5rem;
        }
        
        /* Info Box */
        .info-box { 
          background: #f8fafc; 
          padding: 1.25rem; 
          margin: 1.5rem 0; 
          border-radius: 0.75rem; 
          border: 1px solid #e5e7eb; 
        }
        .info-box p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }
        .info-box strong {
          color: #374151;
          font-weight: 600;
        }
        .info-box .value {
          color: #6b7280;
        }
        
        /* Fioretto Preview (comme sur le site) */
        .fioretto-card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e9e8f0;
          overflow: hidden;
          margin: 1.5rem 0;
        }
        .fioretto-header {
          background: ${typeConfig.bgColor};
          padding: 1rem 1.5rem;
          border-bottom: 2px solid ${typeConfig.color}20;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .fioretto-header .icon {
          font-size: 1.5rem;
        }
        .fioretto-header .type {
          font-weight: 600;
          font-size: 0.875rem;
          color: ${typeConfig.color};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .fioretto-content {
          padding: 1.5rem;
          font-size: 1rem;
          line-height: 1.8;
          color: #4b5563;
          white-space: pre-wrap;
          font-family: 'Crimson Text', Georgia, serif;
          font-style: italic;
          max-height: 200px;
          overflow: hidden;
          position: relative;
        }
        .fioretto-content::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: linear-gradient(to bottom, transparent, white);
        }
        
        .button-container {
          text-align: center;
          margin: 2rem 0;
        }
        .button { 
          display: inline-block; 
          background: white; 
          color: #0EA5E9; 
          padding: 12px 28px; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 600;
          font-size: 0.9rem;
          margin: 16px 0;
          border: 2px solid #0EA5E9;
        }
        .footer { 
          text-align: center; 
          padding: 2rem; 
          background: #f8fafc;
          border-top: 1px solid #e9e8f0;
        }
        .footer-title {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.1rem;
          color: #1f2345;
          margin-bottom: 0.5rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="emoji">🔔</span>
          <h1>Nouveau partage à modérer</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Bonjour ${moderatorName},</p>
          <p class="message">Un nouveau témoignage attend votre validation :</p>
          
          <div class="info-box">
            <p><strong>👤 Auteur :</strong> <span class="value">${fiorettoData.authorName}</span></p>
            <p><strong>📧 Email :</strong> <span class="value">${fiorettoData.authorEmail}</span></p>
            <p><strong>📅 Soumis le :</strong> <span class="value">${new Date(fiorettoData.submittedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}</span></p>
            <p><strong>🎭 Anonymat demandé :</strong> <span class="value">${fiorettoData.isAnonymous ? '✅ Oui' : '❌ Non'}</span></p>
          </div>
          
          <div class="fioretto-card">
            <div class="fioretto-header">
              <span class="icon">${typeConfig.icon}</span>
              <span class="type">${typeConfig.label}</span>
            </div>
            <div class="fioretto-content">${fiorettoData.content.substring(0, 300)}${fiorettoData.content.length > 300 ? '...' : ''}</div>
          </div>
          
          <div class="button-container">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/moderation" class="button">
              👉 Accéder à la modération
            </a>
          </div>
        </div>
        
        <div class="footer">
          <strong>Carnet Spirituel - Modération</strong>
          <p style="font-size: 0.85rem; color: #9ca3af; margin: 0.5rem 0;">Cultivez la présence de Dieu dans vos vies</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: moderatorEmail,
    subject: `🔔 Nouveau partage à modérer (${typeConfig.label})`,
    html,
  });
}
