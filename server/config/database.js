const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: process.env.DB_NAME || 'ecommerce_mascotas',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 60000
};

const pool = mysql.createPool(dbConfig);

// Probar conexión con reintentos
const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Conectado a la base de datos MySQL');
      connection.release();
      return;
    } catch (err) {
      console.error(`⚠️ Intento ${i + 1}/${retries} fallido: ${err.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.error('❌ No se pudo conectar a la base de datos. La app continuará e intentará reconectarse.');
};

testConnection();

module.exports = pool;