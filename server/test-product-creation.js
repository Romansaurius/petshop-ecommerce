const mysql = require('mysql2/promise');

async function testProductCreation() {
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
    
    // Probar inserción directa
    const [result] = await connection.execute(`
      INSERT INTO productos (nombre, descripcion, precio, categoria_id, destacado, descuento_porcentaje, stock, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Producto de Prueba',
      'Descripción de prueba',
      25999.99,
      1, // comederos
      0,
      0,
      100,
      1
    ]);
    
    console.log('✅ Producto creado con ID:', result.insertId);
    
    // Verificar que se creó
    const [products] = await connection.execute('SELECT * FROM productos WHERE id = ?', [result.insertId]);
    console.log('📦 Producto creado:', products[0]);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductCreation();