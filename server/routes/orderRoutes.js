const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// POST /api/orders - Crear nuevo pedido (simulación de pago)
router.post('/', async (req, res) => {
  try {
    const { usuario_id, items, direccion_envio, telefono_contacto } = req.body;
    
    // Calcular total
    const subtotal = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    const impuestos = subtotal * 0.21; // IVA 21%
    const total = subtotal + impuestos;
    
    const orderId = await Order.create({
      usuario_id,
      total,
      direccion_envio,
      telefono_contacto,
      items
    });
    
    res.status(201).json({
      message: 'Pedido creado exitosamente (Pago simulado)',
      orderId,
      total,
      estado: 'pendiente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// GET /api/orders/user/:userId - Obtener pedidos del usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.getByUserId(userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

module.exports = router;