const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: process.env.DB_NAME || 'ecommerce_mascotas',
  connectTimeout: 60000
};

async function migrate() {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado');

    // 1. Columnas faltantes en pedidos
    const pedidosCols = [
      "ADD COLUMN nombre_contacto VARCHAR(200)",
      "ADD COLUMN email_contacto VARCHAR(200)",
      "ADD COLUMN telefono_contacto VARCHAR(50)",
    ];
    for (const col of pedidosCols) {
      try {
        await conn.execute(`ALTER TABLE pedidos ${col}`);
        console.log(`✅ pedidos: ${col.split(' ')[2]}`);
      } catch (e) {
        console.log(`⚠️  pedidos: ${col.split(' ')[2]} ya existe`);
      }
    }

    // 2. Tabla home_secciones
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS home_secciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        clave VARCHAR(50) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        orden INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla home_secciones creada');

    // 3. Tabla home_seccion_productos
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS home_seccion_productos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        seccion_id INT NOT NULL,
        producto_id INT NOT NULL,
        orden INT DEFAULT 0,
        FOREIGN KEY (seccion_id) REFERENCES home_secciones(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_seccion_producto (seccion_id, producto_id)
      )
    `);
    console.log('✅ Tabla home_seccion_productos creada');

    // 4. Insertar secciones por defecto
    const secciones = [
      ['lanzamientos', 'Lanzamientos Exclusivos', 1],
      ['natural', 'Nuestra Selección Natural', 2],
      ['camas', 'El descanso que se merece', 3],
      ['juguetes', 'Ideales para los más juguetones', 4],
    ];
    for (const [clave, nombre, orden] of secciones) {
      await conn.execute(
        'INSERT IGNORE INTO home_secciones (clave, nombre, orden) VALUES (?, ?, ?)',
        [clave, nombre, orden]
      );
    }
    console.log('✅ Secciones por defecto insertadas');

    console.log('\n🎉 Migración completada');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
