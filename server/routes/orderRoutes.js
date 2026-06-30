const express = require('express');
const Order = require('../models/Order');
const auth = require('../middlewares/auth');
const router = express.Router();

// GET /api/orders - Todos los pedidos (solo admin)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });
    const orders = await Order.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// PUT /api/orders/:id/estado - Cambiar estado del pedido (solo admin)
router.put('/:id/estado', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
    await Order.updateEstado(req.params.id, estado);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// POST /api/orders - Crear nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { usuario_id, items, direccion_envio, telefono_contacto } = req.body;
    const subtotal = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    const total = subtotal;
    const orderId = await Order.create({ usuario_id, total, direccion_envio, telefono_contacto, items });
    res.status(201).json({ message: 'Pedido creado exitosamente', orderId, total, estado: 'pendiente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// GET /api/orders/user/:userId - Pedidos del usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.getByUserId(req.params.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

module.exports = router;