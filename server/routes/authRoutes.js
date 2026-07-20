const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const db = require('../config/database');
const auth = require('../middlewares/auth');
const { sendEmail, emailTemplates } = require('../config/email');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'El email ya está registrado' });

    const userId = await User.create({ nombre, email, password, telefono, direccion });
    const newUser = await User.findById(userId);
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: userId, nombre, email, role: newUser.role, compras_realizadas: newUser.compras_realizadas }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
  }
});

// POST /api/auth/login — devuelve token directo o requiere 2FA si está activado
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await User.validatePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Si tiene 2FA activado, enviar código
    if (user.two_factor_enabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await db.execute(
        'UPDATE usuarios SET two_factor_code = ?, two_factor_expires = ? WHERE id = ?',
        [code, expires, user.id]
      );
      const tpl = emailTemplates.twoFactor(code);
      await sendEmail({ to: user.email, ...tpl });
      return res.json({ requires2FA: true, userId: user.id });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role, compras_realizadas: user.compras_realizadas }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const [[user]] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND two_factor_code = ? AND two_factor_expires > NOW()',
      [userId, code]
    );
    if (!user) return res.status(400).json({ error: 'Código inválido o expirado' });

    await db.execute('UPDATE usuarios SET two_factor_code = NULL, two_factor_expires = NULL WHERE id = ?', [user.id]);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Verificación exitosa',
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role, compras_realizadas: user.compras_realizadas }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar código' });
  }
});

// POST /api/auth/toggle-2fa — activar/desactivar 2FA
router.post('/toggle-2fa', auth, async (req, res) => {
  try {
    const [[user]] = await db.execute('SELECT two_factor_enabled FROM usuarios WHERE id = ?', [req.user.id]);
    const newVal = !user.two_factor_enabled;
    await db.execute('UPDATE usuarios SET two_factor_enabled = ? WHERE id = ?', [newVal, req.user.id]);
    res.json({ two_factor_enabled: newVal });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar 2FA' });
  }
});

// GET /api/auth/2fa-status
router.get('/2fa-status', auth, async (req, res) => {
  try {
    const [[user]] = await db.execute('SELECT two_factor_enabled FROM usuarios WHERE id = ?', [req.user.id]);
    res.json({ two_factor_enabled: !!user.two_factor_enabled });
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    // Siempre responder OK para no revelar si el email existe
    if (!user) return res.json({ message: 'Si el email existe, recibirás un link.' });

    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await db.execute(
      'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [token, expires, user.id]
    );

    const link = `${FRONTEND_URL}/reset-password?token=${token}`;
    const tpl = emailTemplates.resetPassword(link);
    await sendEmail({ to: user.email, ...tpl });

    res.json({ message: 'Si el email existe, recibirás un link.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const [[user]] = await db.execute(
      'SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    if (!user) return res.status(400).json({ error: 'Link inválido o expirado' });

    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      'UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashed, user.id]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
});

// GET /api/auth/verify
router.get('/verify', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
