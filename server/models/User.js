const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { nombre, email, password, telefono, direccion } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Determinar si es admin basado en el email
    const role = email === 'admin@petshop.com' ? 'admin' : 'user';
    
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, email, password, telefono, direccion, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, telefono, direccion, role]
    );
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, nombre, email, telefono, direccion, role, compras_realizadas FROM usuarios WHERE id = ?', [id]);
    return rows[0];
  }

  static async updatePurchaseCount(userId) {
    await db.execute(
      'UPDATE usuarios SET compras_realizadas = compras_realizadas + 1 WHERE id = ?',
      [userId]
    );
  }

  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;