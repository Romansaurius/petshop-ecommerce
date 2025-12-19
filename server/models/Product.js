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

  static async create(productData) {
    try {
      const { nombre, descripcion, precio, categoria, imagen, destacado, descuento_porcentaje } = productData;
      
      // Obtener categoria_id
      const [categoryRows] = await db.execute('SELECT id FROM categorias WHERE nombre = ?', [categoria]);
      const categoria_id = categoryRows[0]?.id || 1; // Default a primera categoría
      
      const [result] = await db.execute(`
        INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen, destacado, descuento_porcentaje, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [nombre, descripcion, precio, categoria_id, imagen, destacado || false, descuento_porcentaje || 0, 100]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const { nombre, descripcion, precio, categoria, imagen, destacado, descuento_porcentaje } = productData;
      
      let query = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, destacado = ?, descuento_porcentaje = ?';
      let params = [nombre, descripcion, precio, destacado || false, descuento_porcentaje || 0];
      
      if (categoria) {
        const [categoryRows] = await db.execute('SELECT id FROM categorias WHERE nombre = ?', [categoria]);
        const categoria_id = categoryRows[0]?.id;
        if (categoria_id) {
          query += ', categoria_id = ?';
          params.push(categoria_id);
        }
      }
      
      if (imagen) {
        query += ', imagen = ?';
        params.push(imagen);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      await db.execute(query, params);
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.execute('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const [totalProducts] = await db.execute('SELECT COUNT(*) as total FROM productos WHERE activo = TRUE');
      const [lowStock] = await db.execute('SELECT COUNT(*) as total FROM productos WHERE stock < 10 AND activo = TRUE');
      const [featured] = await db.execute('SELECT COUNT(*) as total FROM productos WHERE destacado = TRUE AND activo = TRUE');
      
      return {
        totalProducts: totalProducts[0].total,
        lowStock: lowStock[0].total,
        featured: featured[0].total
      };
    } catch (error) {
      console.error('Error en getStats:', error);
      throw error;
    }
  }

  static async getCategories() {
    try {
      const [rows] = await db.execute('SELECT * FROM categorias ORDER BY nombre');
      return rows;
    } catch (error) {
      console.error('Error en getCategories:', error);
      throw error;
    }
  }
}

module.exports = Product;