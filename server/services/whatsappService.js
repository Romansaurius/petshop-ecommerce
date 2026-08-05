const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Number(n) || 0);

const estadoMensajes = {
  confirmado: (nombre, pedidoId) =>
    `Hola ${nombre}, muchas gracias por tu compra en MauLu PetShop! 🐾\n\nTu pedido *#${pedidoId}* fue confirmado y ya lo estamos preparando con mucho cuidado.\n\nTe avisaremos cuando este listo y en camino! 🚚`,

  procesando: (nombre, pedidoId) =>
    `Hola ${nombre}! 📦\n\nTu pedido *#${pedidoId}* esta siendo preparado. Pronto estara listo para enviarse.`,

  enviado: (nombre, pedidoId) =>
    `Hola ${nombre}! 🚚\n\nTu pedido *#${pedidoId}* ya esta en camino. Pronto llegara a tu domicilio.\n\nCualquier consulta respondé este mensaje.`,

  entregado: (nombre, pedidoId) =>
    `Hola ${nombre}! ✅\n\nTu pedido *#${pedidoId}* fue entregado exitosamente. Esperamos que vos y tu mascota lo disfruten mucho!\n\nGracias por elegirnos 🐾`,

  cancelado: (nombre, pedidoId) =>
    `Hola ${nombre}. Tu pedido *#${pedidoId}* fue cancelado. Si tenes alguna duda contactanos respondiendo este mensaje.`,
};

const buildConfirmacionMsg = (order) => {
  const nombre = order.cliente_nombre || order.nombre_contacto || 'cliente';
  const productos = order.productos || 'Ver detalle en la tienda';
  const total = formatPrice(order.total);
  const envio = order.metodo_envio || 'A confirmar';

  return (
    `Hola *${nombre}*, muchas gracias por tu compra! 🐾\n\n` +
    `Tu pedido detallado es:\n` +
    `📦 *${productos}*\n\n` +
    `💰 Total: *${total}*\n` +
    `🚚 Envio: ${envio}\n` +
    `🔖 Pedido: *#${order.id}*\n\n` +
    `Te avisaremos cuando tu pedido este listo y en camino!`
  );
};

const sendWhatsApp = async (telefono, mensaje) => {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // 'whatsapp:+14155238886' (sandbox) o tu numero aprobado

  if (!sid || !token || !from) {
    console.log(`[WHATSAPP SIMULADO] Para: ${telefono}\n${mensaje}`);
    return;
  }

  // Normalizar número: asegurar formato internacional sin espacios ni guiones
  let numero = telefono.replace(/[\s\-\(\)]/g, '');
  if (!numero.startsWith('+')) {
    // Asumir Argentina si no tiene código de país
    numero = '+54' + numero.replace(/^0/, '');
  }

  try {
    const twilio = require('twilio')(sid, token);
    await twilio.messages.create({
      from,
      to: `whatsapp:${numero}`,
      body: mensaje,
    });
    console.log(`[WHATSAPP] Enviado a ${numero}`);
  } catch (e) {
    console.error('[WHATSAPP] Error:', e.message);
  }
};

const sendOrderConfirmationWhatsApp = async (order) => {
  const telefono = order.cliente_telefono || order.telefono_contacto;
  if (!telefono) return;
  const mensaje = buildConfirmacionMsg(order);
  await sendWhatsApp(telefono, mensaje);
};

const sendOrderStatusWhatsApp = async (order, estado) => {
  const telefono = order.cliente_telefono || order.telefono_contacto;
  if (!telefono) return;
  const nombre = order.cliente_nombre || order.nombre_contacto || 'cliente';
  const fn = estadoMensajes[estado];
  if (!fn) return;
  await sendWhatsApp(telefono, fn(nombre, order.id));
};

module.exports = { sendOrderConfirmationWhatsApp, sendOrderStatusWhatsApp };
