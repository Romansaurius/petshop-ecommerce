const express = require('express');
const db = require('../config/database');
const auth = require('../middlewares/auth');
const router = express.Router();

const PUNTOS_POR_PESO = 1 / 100; // 1 punto cada $100

// Calcular nivel activo del usuario
function calcularNivel(usuario) {
  if (usuario.nivel !== 'normal' && usuario.nivel_expira) {
    const ahora = new Date();
    const expira = new Date(usuario.nivel_expira);
    if (ahora > expira) return 'normal';
    return usuario.nivel;
  }
  return 'normal';
}

// GET /api/loyalty/canjes - Todos los canjes disponibles
router.get('/canjes', async (req, res) => {
  try {
    const [canjes] = await db.execute(`SELECT * FROM canjes WHERE activo = TRUE ORDER BY puntos_requeridos ASC`);
    res.json(canjes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/loyalty/perfil - Puntos y nivel del usuario
router.get('/perfil', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT puntos, puntos_historicos, nivel, nivel_expira FROM usuarios WHERE id = ?`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });

    const usuario = rows[0];
    const nivelActivo = calcularNivel(usuario);

    // Si el nivel expiró, actualizarlo en DB
    if (nivelActivo === 'normal' && usuario.nivel !== 'normal') {
      await db.execute(`UPDATE usuarios SET nivel = 'normal', nivel_expira = NULL WHERE id = ?`, [req.user.id]);
    }

    res.json({
      puntos: usuario.puntos,
      puntos_historicos: usuario.puntos_historicos,
      nivel: nivelActivo,
      nivel_expira: nivelActivo !== 'normal' ? usuario.nivel_expira : null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/loyalty/historial - Historial de canjes del usuario
router.get('/historial', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT cu.*, c.nombre, c.descripcion, c.categoria, c.tipo, c.valor_descuento
       FROM canjes_usuario cu
       JOIN canjes c ON cu.canje_id = c.id
       WHERE cu.usuario_id = ?
       ORDER BY cu.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/loyalty/canjear - Canjear un premio
router.post('/canjear', auth, async (req, res) => {
  try {
    const { canje_id } = req.body;
    const userId = req.user.id;

    const [[canje]] = await db.execute(`SELECT * FROM canjes WHERE id = ? AND activo = TRUE`, [canje_id]);
    if (!canje) return res.status(404).json({ error: 'Canje no encontrado' });

    const [[usuario]] = await db.execute(
      `SELECT puntos, puntos_historicos, nivel, nivel_expira FROM usuarios WHERE id = ?`, [userId]
    );

    const nivelActivo = calcularNivel(usuario);

    // Verificar puntos suficientes
    if (usuario.puntos < canje.puntos_requeridos) {
      return res.status(400).json({ error: 'No tenés suficientes puntos' });
    }

    // Verificar acceso por nivel
    if (canje.categoria === 'gold' && usuario.puntos_historicos < 1000) {
      return res.status(400).json({ error: 'Necesitás 1000 puntos históricos para acceder a canjes Gold' });
    }
    if (canje.categoria === 'platinum' && usuario.puntos_historicos < 1750) {
      return res.status(400).json({ error: 'Necesitás 1750 puntos históricos para acceder a canjes Platinum' });
    }

    // Generar código único
    const codigo = `MAULU-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Descontar puntos
    await db.execute(
      `UPDATE usuarios SET puntos = puntos - ? WHERE id = ?`,
      [canje.puntos_requeridos, userId]
    );

    // Si es canje de nivel Gold o Platinum, activar nivel (solo si no tiene uno activo superior)
    if (canje.categoria === 'gold' || canje.categoria === 'platinum') {
      const jerarquia = { normal: 0, gold: 1, platinum: 2 };
      const nivelCanje = canje.categoria;

      // Solo activar si el nivel del canje es >= al nivel actual
      // Y los 30 días cuentan desde el PRIMER canje, no se reinician
      if (jerarquia[nivelCanje] >= jerarquia[nivelActivo]) {
        if (nivelActivo === 'normal') {
          // Activar nuevo nivel por 30 días
          const expira = new Date();
          expira.setDate(expira.getDate() + 30);
          await db.execute(
            `UPDATE usuarios SET nivel = ?, nivel_expira = ? WHERE id = ?`,
            [nivelCanje, expira, userId]
          );
        }
        // Si ya tiene ese nivel activo, NO reiniciar los 30 días
      }
    }

    // Registrar canje
    await db.execute(
      `INSERT INTO canjes_usuario (usuario_id, canje_id, puntos_gastados, codigo) VALUES (?, ?, ?, ?)`,
      [userId, canje_id, canje.puntos_requeridos, codigo]
    );

    res.json({ success: true, codigo, mensaje: `¡Canje exitoso! Tu código es ${codigo}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/loyalty/sumar-puntos - Sumar puntos tras compra (llamado desde orderRoutes)
router.post('/sumar-puntos', auth, async (req, res) => {
  try {
    const { total } = req.body;
    const puntos = Math.floor(total * PUNTOS_POR_PESO);
    await db.execute(
      `UPDATE usuarios SET puntos = puntos + ?, puntos_historicos = puntos_historicos + ? WHERE id = ?`,
      [puntos, puntos, req.user.id]
    );
    res.json({ puntos_ganados: puntos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ADMIN - GET /api/loyalty/admin/canjes
router.get('/admin/canjes', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });
  const [canjes] = await db.execute(`SELECT * FROM canjes ORDER BY categoria, puntos_requeridos`);
  res.json(canjes);
});

// ADMIN - POST /api/loyalty/admin/canjes
router.post('/admin/canjes', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });
  const { nombre, descripcion, puntos_requeridos, categoria, tipo, valor_descuento, tope_descuento } = req.body;
  const [result] = await db.execute(
    `INSERT INTO canjes (nombre, descripcion, puntos_requeridos, categoria, tipo, valor_descuento, tope_descuento) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, puntos_requeridos, categoria, tipo, valor_descuento || 0, tope_descuento || 0]
  );
  res.json({ id: result.insertId });
});

// ADMIN - PUT /api/loyalty/admin/canjes/:id
router.put('/admin/canjes/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });
  const { nombre, descripcion, puntos_requeridos, categoria, tipo, valor_descuento, tope_descuento, activo } = req.body;
  await db.execute(
    `UPDATE canjes SET nombre=?, descripcion=?, puntos_requeridos=?, categoria=?, tipo=?, valor_descuento=?, tope_descuento=?, activo=? WHERE id=?`,
    [nombre, descripcion, puntos_requeridos, categoria, tipo, valor_descuento || 0, tope_descuento || 0, activo, req.params.id]
  );
  res.json({ success: true });
});

module.exports = router;
