const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Envoyer un email d'invitation
async function sendInvitation({ email, name, inviterName, hotelName, invitationLink, temporaryPassword }) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; background: #f8f7f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1814, #2d2a24); padding: 40px 30px; text-align: center; }
        .logo { font-family: 'Georgia', serif; font-size: 32px; color: #d4a017; font-weight: bold; margin-bottom: 8px; }
        .subtitle { color: rgba(255,255,255,0.6); font-size: 14px; letter-spacing: 1px; text-transform: uppercase; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1a1814; margin-bottom: 20px; }
        .message { font-size: 15px; color: #666; line-height: 1.8; margin-bottom: 30px; }
        .credentials { background: #f5f0e0; border-left: 4px solid #b8860b; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .credentials-title { font-size: 13px; color: #b8860b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
        .credential-item { margin-bottom: 12px; }
        .credential-label { font-size: 12px; color: #7a7670; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .credential-value { font-size: 16px; color: #1a1814; font-weight: bold; font-family: 'Courier New', monospace; }
        .button { display: inline-block; background: linear-gradient(135deg, #d4a017, #b8860b); color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 20px 0; font-size: 15px; }
        .footer { background: #f3f2ef; padding: 30px; text-align: center; color: #7a7670; font-size: 13px; }
        .warning { background: #fdf0ee; border-left: 4px solid #c0392b; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .warning-text { color: #c0392b; font-size: 13px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏨 HôtelFlow</div>
          <div class="subtitle">${hotelName}</div>
        </div>
        
        <div class="content">
          <div class="greeting">Bonjour${name ? ' ' + name : ''} 👋</div>
          
          <div class="message">
            <strong>${inviterName}</strong> vous invite à rejoindre l'équipe de <strong>${hotelName}</strong> sur HôtelFlow, 
            notre plateforme de gestion de projets et de tâches.
          </div>

          <div class="credentials">
            <div class="credentials-title">🔐 Vos identifiants de connexion</div>
            <div class="credential-item">
              <div class="credential-label">Email</div>
              <div class="credential-value">${email}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Mot de passe temporaire</div>
              <div class="credential-value">${temporaryPassword}</div>
            </div>
          </div>

          <div class="warning">
            <div class="warning-text">
              ⚠️ Important : Changez votre mot de passe dès votre première connexion pour sécuriser votre compte.
            </div>
          </div>

          <center>
            <a href="${invitationLink}" class="button">
              Accéder à HôtelFlow →
            </a>
          </center>

          <div class="message" style="margin-top: 30px;">
            Si vous avez des questions, n'hésitez pas à contacter ${inviterName}.
          </div>
        </div>

        <div class="footer">
          Cet email a été envoyé automatiquement par HôtelFlow.<br>
          Si vous n'êtes pas concerné par cette invitation, vous pouvez ignorer ce message.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${hotelName} - HôtelFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invitation à rejoindre ${hotelName} sur HôtelFlow`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw error;
  }
}

module.exports = { sendInvitation };