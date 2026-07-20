const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL SIMULADO] Para: ${to} | Asunto: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"MauLu PetShop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const emailTemplates = {
  twoFactor: (code) => ({
    subject: 'Tu código de verificación - MauLu',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #eee">
        <img src="https://maulu.onrender.com/logosolo.png" alt="MauLu" style="width:48px;margin-bottom:16px" />
        <h2 style="color:#333;margin:0 0 8px">Código de verificación</h2>
        <p style="color:#666;margin:0 0 24px">Usá este código para iniciar sesión. Expira en 10 minutos.</p>
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:bold;color:#ff6b35">${code}</div>
        <p style="color:#999;font-size:12px;margin-top:24px">Si no fuiste vos, ignorá este email.</p>
      </div>
    `,
  }),

  resetPassword: (link) => ({
    subject: 'Recuperar contraseña - MauLu',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #eee">
        <img src="https://maulu.onrender.com/logosolo.png" alt="MauLu" style="width:48px;margin-bottom:16px" />
        <h2 style="color:#333;margin:0 0 8px">Recuperar contraseña</h2>
        <p style="color:#666;margin:0 0 24px">Hacé clic en el botón para crear una nueva contraseña. El link expira en 1 hora.</p>
        <a href="${link}" style="display:inline-block;background:#ff6b35;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Cambiar contraseña</a>
        <p style="color:#999;font-size:12px;margin-top:24px">Si no solicitaste esto, ignorá este email.</p>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
