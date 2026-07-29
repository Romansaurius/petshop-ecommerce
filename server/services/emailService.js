const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const BRAND_COLOR = '#ff6b35';

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: ${BRAND_COLOR}; padding: 28px 32px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; }
    .body { padding: 32px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .info-box { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e9ecef; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6c757d; }
    .info-value { color: #212529; font-weight: 500; text-align: right; max-width: 300px; }
    .message { font-size: 15px; color: #343a40; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: block; text-align: center; background: ${BRAND_COLOR}; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 24px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #f0f0f0; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #adb5bd; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Maulu Pet Shop</h1>
      <p>petsmaulu@gmail.com</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>Este email fue enviado automaticamente por Maulu Pet Shop.<br>Si tenes alguna consulta, respondé este email.</p>
    </div>
  </div>
</body>
</html>
`;

const estadoConfig = {
  pendiente: {
    badge: { bg: '#fff3cd', color: '#856404', text: 'Pendiente de confirmacion' },
    subject: 'Recibimos tu pedido',
    mensaje: 'Recibimos tu pedido y lo estamos revisando. En breve te confirmamos.',
    icon: '📋'
  },
  procesando: {
    badge: { bg: '#cff4fc', color: '#055160', text: 'En preparacion' },
    subject: 'Tu pedido esta siendo preparado',
    mensaje: 'Estamos preparando tu pedido con mucho cuidado. Pronto estara listo para enviarse.',
    icon: '📦'
  },
  enviado: {
    badge: { bg: '#d1ecf1', color: '#0c5460', text: 'En camino' },
    subject: 'Tu pedido esta en camino',
    mensaje: 'Tu pedido ya fue despachado y esta en camino. Pronto llegara a tu domicilio.',
    icon: '🚚'
  },
  entregado: {
    badge: { bg: '#d4edda', color: '#155724', text: 'Entregado' },
    subject: 'Tu pedido fue entregado',
    mensaje: 'Tu pedido fue entregado exitosamente. Esperamos que vos y tu mascota lo disfruten mucho.',
    icon: '✅'
  },
  cancelado: {
    badge: { bg: '#f8d7da', color: '#721c24', text: 'Cancelado' },
    subject: 'Tu pedido fue cancelado',
    mensaje: 'Tu pedido fue cancelado. Si tenes alguna duda o esto fue un error, por favor contactanos.',
    icon: '❌'
  }
};

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

const buildEmail = (order, estado) => {
  const cfg = estadoConfig[estado] || estadoConfig.pendiente;
  const fecha = order.created_at
    ? new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  const rows = [
    ['Numero de pedido', `#${order.id}`],
    ['Fecha', fecha],
    order.total ? ['Total', formatPrice(order.total)] : null,
    order.metodo_envio ? ['Envio', order.metodo_envio] : null,
    order.productos ? ['Productos', order.productos] : null,
  ].filter(Boolean);

  const content = `
    <p class="message">Hola <strong>${order.cliente_nombre || order.nombre_contacto || 'cliente'}</strong>,</p>
    <span class="status-badge" style="background:${cfg.badge.bg};color:${cfg.badge.color};">${cfg.icon} ${cfg.badge.text}</span>
    <p class="message">${cfg.mensaje}</p>
    <div class="info-box">
      ${rows.map(([label, value]) => `
        <div class="info-row">
          <span class="info-label">${label}</span>
          <span class="info-value">${value}</span>
        </div>`).join('')}
    </div>
    <a href="${process.env.FRONTEND_URL || 'https://maulu.onrender.com'}" class="cta">Ir a la tienda</a>
  `;

  return {
    subject: `${cfg.icon} ${cfg.subject} — Pedido #${order.id}`,
    html: baseTemplate(content)
  };
};

const sendOrderStatusEmail = async (order, estado) => {
  const email = order.cliente_email || order.email_contacto;
  if (!email) return;
  try {
    const { subject, html } = buildEmail(order, estado);
    await transporter.sendMail({
      from: `"Maulu" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html
    });
    console.log(`Email [${estado}] enviado a ${email}`);
  } catch (e) {
    console.error('Error enviando email:', e.message);
  }
};

const sendOrderConfirmationEmail = async (order) => {
  await sendOrderStatusEmail(order, 'pendiente');
};

module.exports = { sendOrderStatusEmail, sendOrderConfirmationEmail };
