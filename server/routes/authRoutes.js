const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// POST /api/auth/register - Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    const userId = await User.create({ nombre, email, password, telefono, direccion });
    const newUser = await User.findById(userId);
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      token,
      user: { 
        id: userId, 
        nombre, 
        email, 
        role: newUser.role,
        compras_realizadas: newUser.compras_realizadas 
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login - Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email,
        role: user.role,
        compras_realizadas: user.compras_realizadas
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;