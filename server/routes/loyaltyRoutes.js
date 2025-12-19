const express = require('express');
const db = require('../config/database');
const auth = require('../middlewares/auth');
const router = express.Router();

// GET /api/loyalty/programs - Obtener programas de fidelización
router.get('/programs', async (req, res) => {
  try {
    const [programs] = await db.execute('SELECT * FROM programas_fidelizacion ORDER BY id');
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener programas' });
  }
});

// POST /api/loyalty/programs - Crear programa (solo admin)
router.post('/programs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { nombre, descripcion, compras_requeridas, recompensa } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO programas_fidelizacion (nombre, descripcion, compras_requeridas, recompensa) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, compras_requeridas, recompensa]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Programa creado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear programa' });
  }
});

// PUT /api/loyalty/programs/:id - Actualizar programa
router.put('/programs/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;
    const { nombre, descripcion, compras_requeridas, recompensa, activo } = req.body;
    
    await db.execute(
      'UPDATE programas_fidelizacion SET nombre = ?, descripcion = ?, compras_requeridas = ?, recompensa = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, compras_requeridas, recompensa, activo, id]
    );
    
    res.json({ message: 'Programa actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar programa' });
  }
});

// GET /api/loyalty/stats - Estadísticas de fidelización
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [activeUsers] = await db.execute('SELECT COUNT(*) as total FROM usuarios WHERE activo = 1');
    const [completedRewards] = await db.execute('SELECT COUNT(*) as total FROM usuario_programa_progreso WHERE completado = TRUE');
    const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM usuarios');
    
    const retentionRate = totalUsers[0].total > 0 ? Math.round((activeUsers[0].total / totalUsers[0].total) * 100) : 0;
    
    res.json({
      usuariosActivos: activeUsers[0].total,
      recompensasCanjeadas: completedRewards[0].total,
      tasaRetencion: retentionRate
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/loyalty/coupons - Obtener cupones
router.get('/coupons', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [coupons] = await db.execute('SELECT * FROM cupones ORDER BY created_at DESC');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cupones' });
  }
});

// POST /api/loyalty/coupons - Crear cupón
router.post('/coupons', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { codigo, nombre, tipo, valor, fecha_expiracion, usos_maximos } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO cupones (codigo, nombre, tipo, valor, fecha_expiracion, usos_maximos) VALUES (?, ?, ?, ?, ?, ?)',
      [codigo, nombre, tipo, valor, fecha_expiracion || null, usos_maximos || null]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Cupón creado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El código del cupón ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear cupón' });
    }
  }
});

module.exports = router;