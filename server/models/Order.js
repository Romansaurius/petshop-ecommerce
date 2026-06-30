const db = require('../config/database');

class Order {
  static async create(orderData) {
    const { usuario_id, total, direccion_envio, telefono_contacto, items } = orderData;
    
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Crear pedido
      const [orderResult] = await connection.execute(
        'INSERT INTO pedidos (usuario_id, total, direccion_envio, telefono_contacto) VALUES (?, ?, ?, ?)',
        [usuario_id, total, direccion_envio, telefono_contacto]
      );
      
      const orderId = orderResult.insertId;
      
      // Crear detalles del pedido
      for (const item of items) {
        await connection.execute(
          'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [orderId, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
      
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const [rows] = await db.execute(
      `SELECT p.*, 
        u.nombre as cliente_nombre, u.email as cliente_email, u.telefono as cliente_telefono,
        GROUP_CONCAT(pr.nombre SEPARATOR ', ') as productos,
        COUNT(dp.id) as cantidad_items
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id
       LEFT JOIN productos pr ON dp.producto_id = pr.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    return rows;
  }

  static async updateEstado(id, estado) {
    await db.execute('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
  }

  static async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT p.*, GROUP_CONCAT(pr.nombre) as productos 
       FROM pedidos p 
       LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id 
       LEFT JOIN productos pr ON dp.producto_id = pr.id 
       WHERE p.usuario_id = ? 
       GROUP BY p.id 
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = Order;