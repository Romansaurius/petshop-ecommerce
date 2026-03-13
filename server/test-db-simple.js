const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  port: 21840,
  user: 'root',
  password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: 'ecommerce_mascotas',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔄 Probando conexión a Railway...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Conexión exitosa');
    
    // Verificar estructura actual
    const [tables] = await connection.execute(`SHOW TABLES`);
    
    console.log('📋 Tablas existentes:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Verificar estructura de productos
    console.log('\n🔍 Estructura de tabla productos:');
    const [columns] = await connection.execute(`DESCRIBE productos`);
    
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    // Contar productos
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM productos');
    console.log(`\n📦 Total productos: ${count[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();