const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Order = require('../models/Order');
const db = require('../config/database');
const router = express.Router();

const getClient = () => new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// POST /api/payment/create
router.post('/create', async (req, res) => {
  try {
    const { items, customerInfo, usuario_id } = req.body;

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

    const orderItems = items.map(item => ({
      producto_id: item.id,
      cantidad: item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity,
      precio_unitario: parseFloat(item.precio || item.price || 0),
      talla: item.talla || null
    }));

    const total = orderItems.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0);

    // Crear pedido pendiente AHORA (no esperar webhook)
    const orderId = await Order.create({
      usuario_id: usuario_id || null,
      total,
      direccion_envio: customerInfo.address || 'A confirmar',
      telefono_contacto: customerInfo.phone || '',
      email: customerInfo.email || '',
      nombre_contacto: customerInfo.name || '',
      items: orderItems
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
          order_id: orderId,
          usuario_id: usuario_id || null
        })
      }
    });

    res.json({ init_point: response.init_point, preference_id: response.id, order_id: orderId });
  } catch (error) {
    console.error('MP Error:', error.message);
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

      if (payment.status === 'approved' && ref.order_id) {
        // Confirmar pedido existente
        await db.execute(
          "UPDATE pedidos SET estado = 'confirmado' WHERE id = ?",
          [ref.order_id]
        );
        // Sumar puntos si tiene cuenta
        if (ref.usuario_id) {
          const puntos = Math.floor(payment.transaction_amount / 100);
          await db.execute(
            'UPDATE usuarios SET puntos = puntos + ?, puntos_historicos = puntos_historicos + ? WHERE id = ?',
            [puntos, puntos, ref.usuario_id]
          );
        }
        console.log('Pago confirmado, pedido actualizado:', ref.order_id);
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.sendStatus(200);
  }
});

module.exports = router;
