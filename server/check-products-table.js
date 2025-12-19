const mysql = require('mysql2/promise');

async function checkProductsTable() {
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
    
    // Verificar estructura de tabla productos
    const [columns] = await connection.execute('DESCRIBE productos');
    console.log('📋 Estructura de tabla productos:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
    });
    
    // Verificar categorías disponibles
    const [categories] = await connection.execute('SELECT * FROM categorias');
    console.log('\n📂 Categorías disponibles:');
    categories.forEach(cat => {
      console.log(`  - ID: ${cat.id}, Nombre: ${cat.nombre}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProductsTable();