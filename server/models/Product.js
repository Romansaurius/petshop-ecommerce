const db = require('../config/database');

class Product {
  static async getAll() {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.id,
          p.nombre,
          p.descripcion,
          p.descripcion_corta,
          p.precio,
          p.precio_oferta,
          p.descuento_porcentaje,
          p.destacado,
          p.imagen,
          p.stock,
          c.nombre as categoria,
          m.nombre as marca
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN marcas m ON p.marca_id = m.id
        WHERE p.activo = TRUE
        ORDER BY p.destacado DESC, p.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.*,
          c.nombre as categoria,
          m.nombre as marca
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN marcas m ON p.marca_id = m.id
        WHERE p.id = ? AND p.activo = TRUE
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  static async getByCategory(categoryName) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.id,
          p.nombre,
          p.descripcion,
          p.precio,
          p.precio_oferta,
          p.descuento_porcentaje,
          p.destacado,
          p.imagen,
          p.stock,
          c.nombre as categoria
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        WHERE c.nombre = ? AND p.activo = TRUE
        ORDER BY p.destacado DESC
      `, [categoryName]);
      return rows;
    } catch (error) {
      console.error('Error en getByCategory:', error);
      throw error;
    }
  }

  static async getFeatured() {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.id,
          p.nombre,
          p.descripcion,
          p.precio,
          p.precio_oferta,
          p.descuento_porcentaje,
          p.destacado,
          p.imagen,
          p.stock,
          c.nombre as categoria
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.destacado = TRUE AND p.activo = TRUE
      `);
      return rows;
    } catch (error) {
      console.error('Error en getFeatured:', error);
      throw error;
    }
  }

  static async search(query) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.id,
          p.nombre,
          p.descripcion,
          p.precio,
          p.precio_oferta,
          p.descuento_porcentaje,
          p.destacado,
          p.imagen,
          p.stock,
          c.nombre as categoria
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.descripcion_corta LIKE ?)
          AND p.activo = TRUE
        ORDER BY p.destacado DESC
      `, [`%${query}%`, `%${query}%`, `%${query}%`]);
      return rows;
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }
}

module.exports = Product;