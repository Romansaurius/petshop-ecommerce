const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Order = require('../models/Order');
const db = require('../config/database');
const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// POST /api/payment/create - Crear preferencia de pago
router.post('/create', async (req, res) => {
  try {
    const { items, customerInfo, usuario_id, discount } = req.body;

    // 1. Guardar pedido en DB con estado pendiente
    const orderItems = items.map(item => ({
      producto_id: item.id,
      cantidad: item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity,
      precio_unitario: parseFloat(item.precio || item.price || 0),
      talla: item.talla || null
    }));

    const totalCalculado = orderItems.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0) - (discount || 0);

    const orderId = await Order.create({
      usuario_id: usuario_id || null,
      email: customerInfo.email || '',
      total: totalCalculado,
      direccion_envio: customerInfo.address || 'A confirmar',
      telefono_contacto: customerInfo.phone || '',
      items: orderItems
    });

    // 2. Crear preferencia en MP
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
        payer: { name: customerInfo.name, email: customerInfo.email },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago/exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago/fallido`,
          pending: `${process.env.FRONTEND_URL}/pago/pendiente`
        },
        auto_return: 'approved',
        statement_descriptor: 'MauLu PetShop',
        external_reference: String(orderId)
      }
    });

    res.json({ init_point: response.init_point, preference_id: response.id, order_id: orderId });
  } catch (error) {
    console.error('MP Error:', error.message);
    res.status(500).json({ error: 'Error al crear preferencia de pago', detalle: error.message });
  }
});

// POST /api/payment/webhook - Notificaciones de MP
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log('Webhook recibido:', type, data);

    if (type === 'payment' && data?.id) {
      const { MercadoPagoConfig: MPConfig, Payment } = require('mercadopago');
      const paymentClient = new Payment(new MPConfig({ accessToken: process.env.MP_ACCESS_TOKEN }));
      const payment = await paymentClient.get({ id: data.id });

      console.log('Pago:', payment.status, 'Referencia:', payment.external_reference);

      const orderId = payment.external_reference;

      if (payment.status === 'approved' && orderId) {
        await Order.updateEstado(orderId, 'confirmado');
        console.log(`Pedido ${orderId} confirmado`);
      } else if (payment.status === 'rejected' && orderId) {
        await Order.updateEstado(orderId, 'cancelado');
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.sendStatus(200);
  }
});

module.exports = router;
