const mysql = require('mysql2/promise');

async function createLoyaltyTables() {
  const dbConfig = {
    host: 'shuttle.proxy.rlwy.net',
    port: 21840,
    user: 'root',
    password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
    database: 'ecommerce_mascotas',
    ssl: false
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');
    
    // Tabla de programas de fidelización
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS programas_fidelizacion (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        compras_requeridas INT NOT NULL,
        recompensa VARCHAR(255) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla programas_fidelizacion creada');
    
    // Tabla de cupones
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cupones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        tipo ENUM('porcentaje', 'monto_fijo') DEFAULT 'monto_fijo',
        valor DECIMAL(10,2) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        fecha_expiracion DATE,
        usos_maximos INT DEFAULT NULL,
        usos_actuales INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla cupones creada');
    
    // Tabla de progreso de usuarios en programas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuario_programa_progreso (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT,
        programa_id INT,
        compras_actuales INT DEFAULT 0,
        completado BOOLEAN DEFAULT FALSE,
        fecha_completado TIMESTAMP NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (programa_id) REFERENCES programas_fidelizacion(id),
        UNIQUE KEY unique_user_program (usuario_id, programa_id)
      )
    `);
    console.log('✅ Tabla usuario_programa_progreso creada');
    
    // Insertar programas de fidelización por defecto
    await connection.execute(`
      INSERT IGNORE INTO programas_fidelizacion (nombre, descripcion, compras_requeridas, recompensa) VALUES
      ('Baño y Corte Gratis', 'Servicio completo de peluquería para tu mascota', 5, 'Servicio de peluquería'),
      ('Cupón $40.000', 'Descuento de $40.000 en tu próxima compra', 10, '$40.000 en compras')
    `);
    console.log('✅ Programas de fidelización insertados');
    
    // Insertar cupones de ejemplo
    await connection.execute(`
      INSERT IGNORE INTO cupones (codigo, nombre, tipo, valor) VALUES
      ('DESCUENTO10', 'Descuento 10%', 'porcentaje', 10),
      ('PETSHOP20', 'Descuento 20%', 'porcentaje', 20),
      ('PRIMERA5', 'Descuento 5%', 'porcentaje', 5),
      ('BIENVENIDO', 'Bienvenido $5000', 'monto_fijo', 5000)
    `);
    console.log('✅ Cupones de ejemplo insertados');
    
    await connection.end();
    console.log('🎉 Tablas de fidelización creadas correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createLoyaltyTables();