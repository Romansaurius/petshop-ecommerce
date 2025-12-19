const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
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
    
    // Actualizar role y contraseña del admin
    const hashedPassword = bcrypt.hashSync('Ranucci2007:)Roman2007', 10);
    
    await connection.execute(
      "UPDATE usuarios SET password = ?, role = ? WHERE email = ?",
      [hashedPassword, 'admin', 'admin@petshop.com']
    );
    
    console.log('✅ Usuario admin actualizado correctamente');
    
    // Verificar cambios
    const [users] = await connection.execute(
      "SELECT id, nombre, email, role FROM usuarios WHERE email = ?",
      ['admin@petshop.com']
    );
    
    if (users.length > 0) {
      const admin = users[0];
      console.log('👤 Usuario admin verificado:');
      console.log('  ID:', admin.id);
      console.log('  Nombre:', admin.nombre);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
    }
    
    await connection.end();
    console.log('🎉 Admin configurado correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAdmin();