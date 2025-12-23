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

/**
 * Email de bienvenue après confirmation du compte
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
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
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header { 
          background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%); 
          color: white; 
          padding: 32px; 
          text-align: center; 
        }
        .header h1 {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .header p {
          margin: 0;
          font-size: 0.95rem;
          opacity: 0.95;
        }
        .content { 
          padding: 32px; 
        }
        .greeting {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 16px;
        }
        .intro {
          font-size: 1rem;
          color: #1f2345;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        
        .section-title {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2345;
          margin: 32px 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .module-card {
          background: #fafafa;
          border-radius: 8px;
          padding: 16px;
          border-left: 3px solid;
        }
        .module-card.grace { border-color: #F59E0B; }
        .module-card.priere { border-color: #6366F1; }
        .module-card.ecriture { border-color: #10B981; }
        .module-card.parole { border-color: #0EA5E9; }
        .module-card.rencontre { border-color: #F43F5E; }
        
        .module-card .emoji {
          font-size: 1.5rem;
          margin-bottom: 8px;
          display: block;
        }
        .module-card .title {
          font-weight: 600;
          font-size: 0.95rem;
          color: #1f2345;
          margin-bottom: 6px;
        }
        .module-card .desc {
          font-size: 0.85rem;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .feature-box {
          background: linear-gradient(135deg, #E0F2FE, #F0F9FF);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #0EA5E9;
        }
        .feature-box h3 {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #075985;
          margin: 0 0 12px 0;
        }
        .feature-box p {
          margin: 8px 0;
          font-size: 0.9rem;
          color: #0c4a6e;
        }
        .feature-box ul {
          margin: 12px 0;
          padding-left: 20px;
        }
        .feature-box li {
          margin: 6px 0;
          font-size: 0.9rem;
          color: #0c4a6e;
        }
        .feature-box .quote {
          font-style: italic;
          font-size: 0.9rem;
          color: #0369a1;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #bae6fd;
        }
        
        .fioretti-box {
          background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #F59E0B;
        }
        .fioretti-box h3 {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #92400e;
          margin: 0 0 12px 0;
        }
        .fioretti-box p {
          margin: 8px 0;
          font-size: 0.9rem;
          color: #78350f;
        }
        .fioretti-box ul {
          margin: 12px 0;
          padding-left: 20px;
        }
        .fioretti-box li {
          margin: 6px 0;
          font-size: 0.9rem;
          color: #78350f;
        }
        
        .cta-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
          text-align: center;
        }
        .cta-section h3 {
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2345;
          margin: 0 0 16px 0;
        }
        .cta-section ol {
          text-align: left;
          margin: 16px auto;
          max-width: 400px;
          padding-left: 20px;
        }
        .cta-section li {
          margin: 10px 0;
          font-size: 0.95rem;
          color: #4b5563;
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #0EA5E9, #0284C7); 
          color: white; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600;
          font-size: 1rem;
          margin: 16px 0;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }
        
        .quote-box {
          background: linear-gradient(135deg, #E0F2FE, #F0F9FF);
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
          text-align: center;
          border: 1px solid #bae6fd;
        }
        .quote-box p {
          font-family: 'Crimson Text', Georgia, serif;
          font-style: italic;
          font-size: 1.05rem;
          color: #075985;
          margin: 0 0 8px 0;
          line-height: 1.6;
        }
        .quote-box .ref {
          font-weight: 600;
          font-size: 0.9rem;
          color: #0EA5E9;
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
        
        @media only screen and (max-width: 600px) {
          .modules-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🕊️ Bienvenue dans votre Carnet Spirituel !</h1>
          <p>Cultivez la présence de Dieu dans vos vies</p>
        </div>
        
        <div class="content">
          <p class="greeting">Bonjour ${userName},</p>
          <p class="intro">
            Nous sommes heureux de vous accueillir dans votre espace de contemplation. 
            Découvrez comment <strong>discerner le fil rouge de l'action de Dieu</strong> dans votre quotidien.
          </p>
          
          <h2 class="section-title">📝 Les 5 modules - Notez l'action de Dieu</h2>
          
          <div class="modules-grid">
            <div class="module-card grace">
              <span class="emoji">✨</span>
              <div class="title">Grâces reçues</div>
              <div class="desc">Notez les bénédictions, les petits miracles du quotidien.</div>
            </div>
            
            <div class="module-card priere">
              <span class="emoji">🙏</span>
              <div class="title">Prières</div>
              <div class="desc">Confiez vos intentions et suivez comment le Seigneur y répond.</div>
            </div>
            
            <div class="module-card ecriture">
              <span class="emoji">📖</span>
              <div class="title">Écritures</div>
              <div class="desc">Méditez la Parole de Dieu et notez ce qui vous touche.</div>
            </div>
            
            <div class="module-card parole">
              <span class="emoji">🕊️</span>
              <div class="title">Paroles</div>
              <div class="desc">Recueillez les inspirations et messages du Saint-Esprit.</div>
            </div>
          </div>
          
          <div class="module-card rencontre" style="max-width: 100%;">
            <span class="emoji">🤝</span>
            <div class="title">Rencontres missionnaires</div>
            <div class="desc">Gardez mémoire des rencontres providentielles.</div>
          </div>
          
          <div class="feature-box">
            <h3>🌿 LA RELECTURE - Contemplez l'action divine</h3>
            <p><strong>Reliez spirituellement vos notes</strong> pour découvrir le fil rouge de Dieu :</p>
            <ul>
              <li>Créez des <strong>liens</strong> entre vos grâces, prières, rencontres</li>
              <li>Voyez comment cette prière <strong>exauce</strong> cette grâce</li>
              <li>Découvrez comment cette parole <strong>accomplit</strong> cet événement</li>
            </ul>
            <p><strong>Contemplez sous 5 angles différents :</strong></p>
            <ul>
              <li>📅 <strong>Chronologique</strong> - Revivez votre parcours spirituel</li>
              <li>📖 <strong>Thématique</strong> - Par type (grâces, prières...)</li>
              <li>❤️ <strong>Mouvements spirituels</strong> - Consolations et désolations</li>
              <li>🌸 <strong>Jardin des grâces</strong> - Vue contemplative</li>
              <li>👁️ <strong>Vue d'ensemble</strong> - Synthèse de votre cheminement</li>
            </ul>
            <p class="quote">« Chercher et trouver Dieu en toutes choses » - Saint Ignace de Loyola</p>
          </div>
          
          <div class="fioretti-box">
            <h3>🌸 Le Jardin des Fioretti - Émerveillez-vous ensemble</h3>
            <p><strong>Partagez les œuvres de Dieu</strong> et <strong>découvrez ce que Dieu fait dans la vie des autres</strong>.</p>
            <ul>
              <li>🌟 <strong>S'émerveiller</strong> de ce que Dieu accomplit</li>
              <li>🙏 <strong>Rendre grâce ensemble</strong> pour ses bienfaits</li>
              <li>💝 <strong>Encourager</strong> la communauté</li>
            </ul>
            <p>Partage <strong>anonyme ou public</strong>, modéré avec bienveillance.</p>
          </div>
          
          <div class="cta-section">
            <h3>🎯 Vos premiers pas</h3>
            <ol>
              <li>📝 <strong>Notez votre première grâce</strong></li>
              <li>🙏 <strong>Confiez une intention</strong></li>
              <li>🌿 <strong>Découvrez la Relecture</strong></li>
            </ol>
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
                Accéder à mon carnet
              </a>
            </center>
          </div>
          
          <div class="quote-box">
            <p>« Rendez grâce en toute circonstance, car c'est la volonté de Dieu à votre égard dans le Christ Jésus. »</p>
            <div class="ref">1 Thessaloniciens 5, 18</div>
          </div>
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
    subject: '🕊️ Bienvenue dans votre Carnet Spirituel',
    html,
  });
}
