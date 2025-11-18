const express = require('express');
const router = express.Router();

// Simulación de carrito en memoria (en producción usar Redis o DB)
let carts = {};

// GET /api/cart/:userId - Obtener carrito del usuario
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const cart = carts[userId] || { items: [], total: 0 };
  res.json(cart);
});

// POST /api/cart/:userId/add - Añadir producto al carrito
router.post('/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { productId, quantity = 1, price, name } = req.body;
  
  if (!carts[userId]) {
    carts[userId] = { items: [], total: 0 };
  }
  
  const existingItem = carts[userId].items.find(item => item.productId === productId);
  
  if (existingItem) {
    // Límite de 10 unidades por producto
    if (existingItem.quantity + quantity > 10) {
      return res.status(400).json({ error: 'Máximo 10 unidades por producto' });
    }
    existingItem.quantity += quantity;
  } else {
    if (quantity > 10) {
      return res.status(400).json({ error: 'Máximo 10 unidades por producto' });
    }
    carts[userId].items.push({ productId, quantity, price, name });
  }
  
  // Recalcular total
  carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.json(carts[userId]);
});

// PUT /api/cart/:userId/update - Actualizar cantidad de producto
router.put('/:userId/update', (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  
  if (!carts[userId]) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }
  
  const item = carts[userId].items.find(item => item.productId === productId);
  if (!item) {
    return res.status(404).json({ error: 'Producto no encontrado en carrito' });
  }
  
  if (quantity > 10) {
    return res.status(400).json({ error: 'Máximo 10 unidades por producto' });
  }
  
  if (quantity <= 0) {
    carts[userId].items = carts[userId].items.filter(item => item.productId !== productId);
  } else {
    item.quantity = quantity;
  }
  
  // Recalcular total
  carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.json(carts[userId]);
});

// DELETE /api/cart/:userId/remove/:productId - Eliminar producto del carrito
router.delete('/:userId/remove/:productId', (req, res) => {
  const { userId, productId } = req.params;
  
  if (!carts[userId]) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }
  
  carts[userId].items = carts[userId].items.filter(item => item.productId !== parseInt(productId));
  carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.json(carts[userId]);
});

module.exports = router;