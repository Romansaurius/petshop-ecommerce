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
      
      // Agregar imágenes de Cloudinary a cada producto
      for (let product of rows) {
        const [images] = await db.execute(
          'SELECT imagen_url, es_principal, orden FROM producto_imagenes WHERE producto_id = ? ORDER BY orden',
          [product.id]
        );
        product.imagenes = images;
      }
      
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
      
      if (rows[0]) {
        // Agregar imágenes de Cloudinary
        const [images] = await db.execute(
          'SELECT imagen_url, es_principal, orden FROM producto_imagenes WHERE producto_id = ? ORDER BY orden',
          [id]
        );
        rows[0].imagenes = images;
      }
      
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
      const { nombre, descripcion, precio, categoria, marca, imagenes, destacado, descuento_porcentaje, stock } = productData;
      
      // Obtener categoria_id por nombre
      const [categoryRows] = await db.execute('SELECT id FROM categorias WHERE nombre = ?', [categoria]);
      const categoria_id = categoryRows[0]?.id;
      
      if (!categoria_id) {
        throw new Error(`Categoría '${categoria}' no encontrada`);
      }
      
      // Obtener marca_id si se proporciona marca
      let marca_id = null;
      if (marca && marca.trim()) {
        const [marcaRows] = await db.execute('SELECT id FROM marcas WHERE nombre = ?', [marca]);
        marca_id = marcaRows[0]?.id;
        
        // Si no existe la marca, crearla
        if (!marca_id) {
          const [newMarca] = await db.execute('INSERT INTO marcas (nombre) VALUES (?)', [marca]);
          marca_id = newMarca.insertId;
        }
      }
      
      // Preparar imágenes para JSON
      const imagenesJson = imagenes && imagenes.length > 0 ? JSON.stringify(imagenes) : JSON.stringify([]);
      const imagenPrincipal = imagenes && imagenes.length > 0 ? imagenes[0] : null;
      
      const [result] = await db.execute(`
        INSERT INTO productos (nombre, descripcion, precio, categoria_id, marca_id, imagen, imagenes, destacado, descuento_porcentaje, stock, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        nombre, 
        descripcion || '', 
        parseFloat(precio), 
        categoria_id,
        marca_id, 
        imagenPrincipal, 
        imagenesJson,
        destacado ? 1 : 0, 
        parseInt(descuento_porcentaje) || 0, 
        parseInt(stock) || 100,
        1
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      const { nombre, descripcion, precio, categoria, marca, imagenes, destacado, descuento_porcentaje, stock } = productData;
      
      let query = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, destacado = ?, descuento_porcentaje = ?';
      let params = [
        nombre, 
        descripcion || '', 
        parseFloat(precio), 
        destacado ? 1 : 0, 
        parseInt(descuento_porcentaje) || 0
      ];
      
      if (stock !== undefined) {
        query += ', stock = ?';
        params.push(parseInt(stock) || 0);
      }
      
      if (categoria) {
        const [categoryRows] = await db.execute('SELECT id FROM categorias WHERE nombre = ?', [categoria]);
        const categoria_id = categoryRows[0]?.id;
        if (categoria_id) {
          query += ', categoria_id = ?';
          params.push(categoria_id);
        }
      }
      
      if (marca !== undefined) {
        let marca_id = null;
        if (marca && marca.trim()) {
          const [marcaRows] = await db.execute('SELECT id FROM marcas WHERE nombre = ?', [marca]);
          marca_id = marcaRows[0]?.id;
          
          // Si no existe la marca, crearla
          if (!marca_id) {
            const [newMarca] = await db.execute('INSERT INTO marcas (nombre) VALUES (?)', [marca]);
            marca_id = newMarca.insertId;
          }
        }
        query += ', marca_id = ?';
        params.push(marca_id);
      }
      
      if (imagenes && imagenes.length > 0) {
        const imagenesJson = JSON.stringify(imagenes);
        const imagenPrincipal = imagenes[0];
        query += ', imagen = ?, imagenes = ?';
        params.push(imagenPrincipal, imagenesJson);
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

  static async getBrands() {
    try {
      const [rows] = await db.execute('SELECT * FROM marcas ORDER BY nombre');
      return rows;
    } catch (error) {
      console.error('Error en getBrands:', error);
      throw error;
    }
  }
}

module.exports = Product;