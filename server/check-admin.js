const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
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
    
    // Buscar usuario admin
    const [users] = await connection.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      ['admin@petshop.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      
      // Crear usuario admin
      const hashedPassword = bcrypt.hashSync('Ranucci2007:)Roman2007', 10);
      console.log('🔑 Hash generado:', hashedPassword);
      
      await connection.execute(
        "INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)",
        ['Administrador', 'admin@petshop.com', hashedPassword, 'admin']
      );
      console.log('✅ Usuario admin creado');
      
    } else {
      const admin = users[0];
      console.log('👤 Usuario admin encontrado:');
      console.log('  ID:', admin.id);
      console.log('  Nombre:', admin.nombre);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
      console.log('  Hash actual:', admin.password);
      
      // Verificar contraseña
      const isValid = bcrypt.compareSync('Ranucci2007:)Roman2007', admin.password);
      console.log('🔐 Contraseña válida:', isValid);
      
      if (!isValid) {
        console.log('🔄 Actualizando contraseña...');
        const newHash = bcrypt.hashSync('Ranucci2007:)Roman2007', 10);
        await connection.execute(
          "UPDATE usuarios SET password = ? WHERE email = ?",
          [newHash, 'admin@petshop.com']
        );
        console.log('✅ Contraseña actualizada');
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdmin();