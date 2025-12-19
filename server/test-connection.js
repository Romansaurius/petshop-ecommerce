const mysql = require('mysql2/promise');

async function testConnection() {
  const dbConfig = {
    host: 'shuttle.proxy.rlwy.net',
    port: 21840,
    user: 'root',
    password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
    database: 'ecommerce_mascotas',
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    ssl: false
  };

  try {
    console.log('🔄 Intentando conectar a la base de datos...');
    console.log('Host:', dbConfig.host);
    console.log('Puerto:', dbConfig.port);
    console.log('Usuario:', dbConfig.user);
    console.log('Base de datos:', dbConfig.database);
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa!');
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', rows);
    
    // Verificar tablas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas en la base de datos:');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    // Verificar estructura de tabla usuarios si existe
    try {
      const [columns] = await connection.execute('DESCRIBE usuarios');
      console.log('👤 Estructura de tabla usuarios:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
      });
    } catch (err) {
      console.log('⚠️  Tabla usuarios no existe');
    }
    
    await connection.end();
    console.log('🔚 Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();