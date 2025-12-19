const mysql = require('mysql2/promise');

async function updateDatabase() {
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
    
    // Agregar columna role
    try {
      await connection.execute("ALTER TABLE usuarios ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
      console.log('✅ Columna role agregada');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Columna role ya existe');
      } else {
        console.error('❌ Error agregando columna role:', err.message);
      }
    }
    
    // Agregar columna compras_realizadas
    try {
      await connection.execute("ALTER TABLE usuarios ADD COLUMN compras_realizadas INT DEFAULT 0");
      console.log('✅ Columna compras_realizadas agregada');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Columna compras_realizadas ya existe');
      } else {
        console.error('❌ Error agregando columna compras_realizadas:', err.message);
      }
    }
    
    // Insertar usuario admin
    try {
      await connection.execute(
        "INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)",
        ['Administrador', 'admin@petshop.com', '$2a$10$srlVoZ.QDTB12ChfJc.vPe7XeTb4wqJ2.HMrz5PqaCv0OVvHndy8y', 'admin']
      );
      console.log('✅ Usuario admin creado');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️  Usuario admin ya existe');
      } else {
        console.error('❌ Error creando usuario admin:', err.message);
      }
    }
    
    // Verificar estructura final
    const [columns] = await connection.execute('DESCRIBE usuarios');
    console.log('\n📋 Estructura final de tabla usuarios:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
    });
    
    await connection.end();
    console.log('\n🎉 Base de datos actualizada correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateDatabase();