const express = require('express');
const db = require('../config/database');
const auth = require('../middlewares/auth');
const router = express.Router();

// GET /api/sections — público, devuelve secciones con sus productos
router.get('/', async (req, res) => {
  try {
    const [sections] = await db.execute(
      'SELECT * FROM home_secciones WHERE activo = TRUE ORDER BY orden ASC'
    );
    for (const section of sections) {
      const [items] = await db.execute(
        `SELECT p.id, p.nombre, p.precio, p.precio_oferta, p.descuento_porcentaje,
                p.imagen, p.imagenes, p.stock, p.tipo, p.destacado, p.tiene_talles,
                c.nombre as categoria
         FROM home_seccion_productos hsp
         JOIN productos p ON hsp.producto_id = p.id
         LEFT JOIN categorias c ON p.categoria_id = c.id
         WHERE hsp.seccion_id = ? AND p.activo = 1
         ORDER BY hsp.orden ASC`,
        [section.id]
      );
      if (items.length) {
        const ids = items.map(i => i.id);
        const [variantes] = await db.execute(
          `SELECT producto_id, talla, precio, stock FROM producto_variantes
           WHERE producto_id IN (${ids.map(() => '?').join(',')}) AND activo = TRUE
           ORDER BY FIELD(talla,'S','M','L','XL','XXL')`,
          ids
        );
        const vMap = {};
        for (const v of variantes) {
          if (!vMap[v.producto_id]) vMap[v.producto_id] = [];
          vMap[v.producto_id].push(v);
        }
        for (const item of items) item.variantes = vMap[item.id] || [];
      }
      section.productos = items;
    }
    res.json(sections);
  } catch (e) {
    console.error('sections GET error:', e.message);
    // Si la tabla no existe aún, devolver array vacío en lugar de 500
    if (e.message.includes("doesn't exist")) return res.json([]);
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/sections/:id/productos — admin: reemplaza los productos de una sección
router.put('/:id/productos', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { producto_ids } = req.body;
  if (!Array.isArray(producto_ids)) return res.status(400).json({ error: 'producto_ids debe ser un array' });

  const conn = await db.getConnection();
  await conn.beginTransaction();
  try {
    await conn.execute('DELETE FROM home_seccion_productos WHERE seccion_id = ?', [req.params.id]);
    for (let i = 0; i < Math.min(producto_ids.length, 5); i++) {
      await conn.execute(
        'INSERT INTO home_seccion_productos (seccion_id, producto_id, orden) VALUES (?, ?, ?)',
        [req.params.id, producto_ids[i], i + 1]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
