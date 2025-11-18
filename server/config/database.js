const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
  port: process.env.DB_PORT || 21840,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: process.env.DB_NAME || 'ecommerce_mascotas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;