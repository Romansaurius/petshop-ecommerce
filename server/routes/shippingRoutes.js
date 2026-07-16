const express = require('express');
const db = require('../config/database');
const auth = require('../middlewares/auth');
const router = express.Router();

// ── Público ──────────────────────────────────────────────────────────────────

// GET /api/shipping/zones  — todas las zonas activas con sus ciudades
router.get('/zones', async (req, res) => {
  try {
    const [zones] = await db.execute('SELECT * FROM shipping_zones WHERE activo = TRUE ORDER BY nombre ASC');
    const [cities] = await db.execute('SELECT * FROM shipping_cities ORDER BY nombre ASC');
    const result = zones.map(z => ({ ...z, cities: cities.filter(c => c.shipping_zone_id === z.id) }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/shipping/config
router.get('/config', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM shipping_config LIMIT 1');
    res.json(rows[0] || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin ─────────────────────────────────────────────────────────────────────

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  next();
};

// Zonas
router.post('/zones', auth, adminOnly, async (req, res) => {
  const { nombre, precio, monto_envio_gratis } = req.body;
  if (!nombre || precio == null) return res.status(400).json({ error: 'nombre y precio requeridos' });
  const [r] = await db.execute('INSERT INTO shipping_zones (nombre, precio, monto_envio_gratis) VALUES (?, ?, ?)', [nombre, precio, monto_envio_gratis || null]);
  res.json({ id: r.insertId, nombre, precio, monto_envio_gratis: monto_envio_gratis || null, activo: true });
});

router.put('/zones/:id', auth, adminOnly, async (req, res) => {
  const { nombre, precio, activo, monto_envio_gratis } = req.body;
  await db.execute('UPDATE shipping_zones SET nombre=?, precio=?, activo=?, monto_envio_gratis=? WHERE id=?', [nombre, precio, activo ?? true, monto_envio_gratis || null, req.params.id]);
  res.json({ ok: true });
});

router.delete('/zones/:id', auth, adminOnly, async (req, res) => {
  const [[{ cnt }]] = await db.execute('SELECT COUNT(*) as cnt FROM shipping_cities WHERE shipping_zone_id=?', [req.params.id]);
  if (cnt > 0) return res.status(400).json({ error: 'La zona tiene ciudades asociadas. Eliminá las ciudades primero.' });
  await db.execute('DELETE FROM shipping_zones WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// Ciudades
router.get('/cities', auth, adminOnly, async (req, res) => {
  const [rows] = await db.execute(
    `SELECT c.*, z.nombre as zona_nombre FROM shipping_cities c
     LEFT JOIN shipping_zones z ON c.shipping_zone_id = z.id
     ORDER BY c.nombre ASC`
  );
  res.json(rows);
});

router.post('/cities', auth, adminOnly, async (req, res) => {
  const { nombre, provincia, shipping_zone_id } = req.body;
  if (!nombre || !shipping_zone_id) return res.status(400).json({ error: 'nombre y zona requeridos' });
  const [r] = await db.execute('INSERT INTO shipping_cities (nombre, provincia, shipping_zone_id) VALUES (?, ?, ?)', [nombre, provincia || '', shipping_zone_id]);
  res.json({ id: r.insertId, nombre, provincia, shipping_zone_id });
});

router.put('/cities/:id', auth, adminOnly, async (req, res) => {
  const { nombre, provincia, shipping_zone_id } = req.body;
  await db.execute('UPDATE shipping_cities SET nombre=?, provincia=?, shipping_zone_id=? WHERE id=?', [nombre, provincia || '', shipping_zone_id, req.params.id]);
  res.json({ ok: true });
});

router.delete('/cities/:id', auth, adminOnly, async (req, res) => {
  await db.execute('DELETE FROM shipping_cities WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// Config
router.put('/config', auth, adminOnly, async (req, res) => {
  const { envio_gratis_activo, monto_envio_gratis, retiro_local_activo } = req.body;
  await db.execute(
    'UPDATE shipping_config SET envio_gratis_activo=?, monto_envio_gratis=?, retiro_local_activo=? WHERE id=1',
    [envio_gratis_activo ? 1 : 0, monto_envio_gratis, retiro_local_activo ? 1 : 0]
  );
  res.json({ ok: true });
});

module.exports = router;
