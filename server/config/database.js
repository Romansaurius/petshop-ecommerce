const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  port: 21840,
  user: 'root',
  password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: 'ecommerce_mascotas',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: false
};

const pool = mysql.createPool(dbConfig);

// Probar conexión
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado a la base de datos MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err.message);
  });

module.exports = pool;