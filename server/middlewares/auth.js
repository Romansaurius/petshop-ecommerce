const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    
    req.user = user;
    console.log('Usuario autenticado:', { id: user.id, email: user.email, role: user.role });
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = authenticateToken;