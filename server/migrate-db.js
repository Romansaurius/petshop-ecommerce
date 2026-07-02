const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: process.env.DB_NAME || 'ecommerce_mascotas',
  connectTimeout: 60000
};

async function migrateDatabase() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('⚡ Ejecutando migración paso a paso...');
    
    // 1. Crear tabla de categorías
    console.log('📂 Creando tabla categorias...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. Crear tabla de marcas
    console.log('🏷️ Creando tabla marcas...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS marcas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 3. Insertar categorías básicas
    console.log('📋 Insertando categorías básicas...');
    const categories = [
      ['comederos', 'Comederos y bebederos para mascotas'],
      ['juguetes', 'Juguetes y entretenimiento para mascotas'],
      ['camas', 'Camas y descanso para mascotas'],
      ['collares', 'Collares, correas y accesorios'],
      ['rascadores', 'Rascadores y torres para gatos'],
      ['otros', 'Otros productos para mascotas']
    ];
    
    for (const [nombre, descripcion] of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categorias (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion]
      );
    }
    
    // 4. Agregar columnas faltantes a productos
    console.log('🔧 Actualizando tabla productos...');
    
    const columnsToAdd = [
      'ADD COLUMN descripcion_corta TEXT',
      'ADD COLUMN precio_oferta DECIMAL(10,2)',
      'ADD COLUMN categoria_id INT',
      'ADD COLUMN marca_id INT',
      'ADD COLUMN imagenes JSON',
      'ADD COLUMN descuento_porcentaje INT DEFAULT 0',
      'ADD COLUMN activo BOOLEAN DEFAULT TRUE',
      'ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    ];
    
    for (const column of columnsToAdd) {
      try {
        await connection.execute(`ALTER TABLE productos ${column}`);
        console.log(`  ✅ Agregada columna: ${column.split(' ')[2]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ⚠️ Columna ya existe: ${column.split(' ')[2]}`);
        } else {
          console.log(`  ❌ Error agregando columna: ${error.message}`);
        }
      }
    }
    
    // 5. Actualizar productos existentes
    console.log('🔄 Actualizando productos existentes...');
    
    // Establecer activo = TRUE para todos los productos
    await connection.execute('UPDATE productos SET activo = TRUE WHERE activo IS NULL');
    
    // Actualizar stock por defecto
    await connection.execute('UPDATE productos SET stock = 100 WHERE stock = 0 OR stock IS NULL');
    
    // 6. Migrar categorías de ENUM a tabla
    console.log('🔄 Migrando categorías...');
    try {
      await connection.execute(`
        UPDATE productos p 
        JOIN categorias c ON p.categoria = c.nombre 
        SET p.categoria_id = c.id 
        WHERE p.categoria_id IS NULL
      `);
    } catch (error) {
      console.log('⚠️ Error migrando categorías (puede ser normal si ya están migradas)');
    }
    
    // 7. Crear tabla de imágenes
    console.log('🖼️ Creando tabla producto_imagenes...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS producto_imagenes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        producto_id INT NOT NULL,
        imagen_url VARCHAR(500) NOT NULL,
        es_principal BOOLEAN DEFAULT FALSE,
        orden INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      )
    `);
    
    // 8. Crear tabla de variantes (talles)
    console.log('📏 Creando tabla producto_variantes...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS producto_variantes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          producto_id INT NOT NULL,
          talla VARCHAR(50) NOT NULL,
          precio DECIMAL(10,2) NOT NULL,
          stock INT DEFAULT 0,
          activo BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
          UNIQUE KEY unique_producto_talla (producto_id, talla)
        )
      `);
      console.log('  ✅ Tabla producto_variantes creada');
    } catch (error) {
      console.log('  ⚠️ Error creando tabla variantes:', error.message);
    }
    
    // 9. Agregar columna tiene_talles a productos
    try {
      await connection.execute(`ALTER TABLE productos ADD COLUMN tiene_talles BOOLEAN DEFAULT FALSE`);
      console.log('  ✅ Columna tiene_talles agregada');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('  ⚠️ Error agregando tiene_talles:', error.message);
      }
    }
    
    // 10. Agregar columna talla a detalles_pedido
    try {
      await connection.execute(`ALTER TABLE detalles_pedido ADD COLUMN talla VARCHAR(50)`);
      console.log('  ✅ Columna talla agregada a detalles_pedido');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('  ⚠️ Error agregando talla:', error.message);
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    console.log('📊 Verificando estructura...');
    
    // Verificar categorías
    const [categories_result] = await connection.execute('SELECT COUNT(*) as count FROM categorias');
    console.log(`📂 Categorías disponibles: ${categories_result[0].count}`);
    
    // Verificar productos
    const [products_result] = await connection.execute('SELECT COUNT(*) as count FROM productos WHERE activo = TRUE');
    console.log(`📦 Productos activos: ${products_result[0].count}`);
    
    console.log('🎉 Base de datos actualizada correctamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar migración
migrateDatabase();