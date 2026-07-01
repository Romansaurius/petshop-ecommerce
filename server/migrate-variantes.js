const mysql = require('mysql2/promise');
const pool = require('./config/database');

async function migrateVariantes() {
  try {
    console.log('🔄 Creando tabla de variantes...');
    
    // Crear tabla de variantes
    await pool.execute(`
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
    
    console.log('✅ Tabla producto_variantes creada exitosamente');
    
    // Agregar columna para indicar si producto tiene talles
    try {
      await pool.execute(`ALTER TABLE productos ADD COLUMN tiene_talles BOOLEAN DEFAULT FALSE`);
      console.log('✅ Columna tiene_talles agregada');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error agregando columna:', error.message);
      } else {
        console.log('⚠️ Columna tiene_talles ya existe');
      }
    }
    
    // Agregar columna talla a detalles_pedido
    try {
      await pool.execute(`ALTER TABLE detalles_pedido ADD COLUMN talla VARCHAR(50)`);
      console.log('✅ Columna talla agregada a detalles_pedido');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error agregando columna talla:', error.message);
      } else {
        console.log('⚠️ Columna talla en detalles_pedido ya existe');
      }
    }
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

migrateVariantes();