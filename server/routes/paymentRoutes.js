const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Order = require('../models/Order');
const router = express.Router();

const getClient = () => new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// POST /api/payment/create
router.post('/create', async (req, res) => {
  try {
    const { items, customerInfo, usuario_id, discount } = req.body;

    const mpItems = items.map(item => {
      const precio = parseFloat(item.precio || item.price || 0);
      const cantidad = item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity;
      return {
        id: String(item.id),
        title: String(item.nombre || item.name || 'Producto').slice(0, 256),
        quantity: Number(cantidad),
        unit_price: Number(precio.toFixed(2)),
        currency_id: 'ARS'
      };
    });

    const preference = new Preference(getClient());
    const response = await preference.create({
      body: {
        items: mpItems,
        payer: { name: customerInfo.name, email: customerInfo.email },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago/exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago/fallido`,
          pending: `${process.env.FRONTEND_URL}/pago/pendiente`
        },
        auto_return: 'approved',
        statement_descriptor: 'MauLu PetShop',
        external_reference: JSON.stringify({
          usuario_id: usuario_id || null,
          direccion: customerInfo.address || '',
          telefono: customerInfo.phone,
          email: customerInfo.email,
          items: items.map(item => ({
            producto_id: item.id,
            cantidad: item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity,
            precio_unitario: parseFloat(item.precio || item.price || 0),
            talla: item.talla || null
          }))
        })
      }
    });

    res.json({ init_point: response.init_point, preference_id: response.id });
  } catch (error) {
    console.error('MP Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Error al crear preferencia de pago', detalle: error.message });
  }
});

// POST /api/payment/webhook
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
      const paymentClient = new Payment(getClient());
      const payment = await paymentClient.get({ id: data.id });
      const ref = JSON.parse(payment.external_reference || '{}');

      if (payment.status === 'approved') {
        const orderId = await Order.create({
          usuario_id: ref.usuario_id || null,
          total: payment.transaction_amount,
          direccion_envio: ref.direccion || 'A confirmar',
          telefono_contacto: ref.telefono || '',
          items: ref.items || []
        });
        // Sumar puntos
        if (ref.usuario_id) {
          const db = require('../config/database');
          const puntos = Math.floor(payment.transaction_amount / 100);
          await db.execute(
            'UPDATE usuarios SET puntos = puntos + ?, puntos_historicos = puntos_historicos + ? WHERE id = ?',
            [puntos, puntos, ref.usuario_id]
          );
        }
        console.log('Pago aprobado, pedido creado:', orderId);
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.sendStatus(200);
  }
});

module.exports = router;
