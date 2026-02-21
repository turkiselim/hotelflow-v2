require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Test de configuration email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '✓ Défini (' + process.env.EMAIL_APP_PASSWORD.length + ' caractères)' : '✗ Manquant');

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('❌ Variables manquantes dans .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

console.log('\n🔄 Envoi du test...\n');

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Test HôtelFlow ✅',
  text: 'Si vous recevez cet email, la configuration fonctionne parfaitement !',
}, (err, info) => {
  if (err) {
    console.error('❌ ERREUR DÉTAILLÉE:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('\n🔧 SOLUTION:');
    if (err.code === 'EAUTH') {
      console.error('→ Mot de passe incorrect. Vérifiez votre App Password Gmail.');
      console.error('→ Allez sur: https://myaccount.google.com/apppasswords');
    }
  } else {
    console.log('✅✅✅ EMAIL ENVOYÉ AVEC SUCCÈS ! ✅✅✅');
    console.log('ID:', info.messageId);
    console.log('\nVérifiez votre boîte email:', process.env.EMAIL_USER);
  }
  process.exit();
});