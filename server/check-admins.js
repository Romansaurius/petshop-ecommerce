const mysql = require('mysql2/promise');

async function checkAdmins() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'shuttle.proxy.rlwy.net',
      port: 21840,
      user: 'root',
      password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
      database: 'ecommerce_mascotas',
      connectTimeout: 30000
    });

    const [users] = await connection.execute(
      'SELECT id, nombre, email, role FROM usuarios'
    );

    console.log('Usuarios en la base de datos:');
    users.forEach(u => console.log(`  ID:${u.id} | ${u.email} | role: ${u.role}`));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkAdmins();