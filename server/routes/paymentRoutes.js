const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Order = require('../models/Order');
const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// POST /api/payment/create - Crear preferencia de pago
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

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: customerInfo.name,
          email: customerInfo.email
        },
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
          telefono: customerInfo.phone
        })
      }
    });

    res.json({ init_point: response.init_point, preference_id: response.id });
  } catch (error) {
    console.error('MP Error completo:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Error al crear preferencia de pago', detalle: error.message });
  }
});

// POST /api/payment/webhook - Notificaciones de MP
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
      const { MercadoPagoConfig: MPConfig, Payment } = require('mercadopago');
      const paymentClient = new Payment(new MPConfig({ accessToken: process.env.MP_ACCESS_TOKEN }));
      const payment = await paymentClient.get({ id: data.id });

      if (payment.status === 'approved') {
        const ref = JSON.parse(payment.external_reference || '{}');
        // Guardar pedido en DB
        await Order.create({
          usuario_id: ref.usuario_id || null,
          total: payment.transaction_amount,
          direccion_envio: ref.direccion || 'Sin dirección',
          telefono_contacto: ref.telefono || '',
          items: [] // Los items ya fueron cobrados por MP
        });
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // Siempre 200 para MP
  }
});

module.exports = router;
