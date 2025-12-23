const mysql = require('mysql2/promise');

const testConnection = async () => {
  const dbConfig = {
    host: 'shuttle.proxy.rlwy.net',
    port: 21840,
    user: 'root',
    password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
    database: 'ecommerce_mascotas',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
    ssl: false
  };

  try {
    console.log('🔄 Intentando conectar...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test exitosa:', rows);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas disponibles:', tables);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('📝 Código de error:', error.code);
    console.error('📝 Estado SQL:', error.sqlState);
  }
};

testConnection();