const db = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión
    const [connection] = await db.execute('SELECT 1 as test');
    console.log('✅ Conexión exitosa');
    
    // Verificar si existen las tablas
    const [tables] = await db.execute('SHOW TABLES');
    console.log('📋 Tablas encontradas:', tables.length);
    tables.forEach(table => console.log('  -', Object.values(table)[0]));
    
    // Contar productos
    const [products] = await db.execute('SELECT COUNT(*) as total FROM productos');
    console.log('📦 Total productos:', products[0].total);
    
    // Mostrar algunos productos
    if (products[0].total > 0) {
      const [sampleProducts] = await db.execute('SELECT id, nombre, precio FROM productos LIMIT 3');
      console.log('🛍️ Productos de ejemplo:');
      sampleProducts.forEach(p => console.log(`  - ${p.nombre}: $${p.precio}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

testDatabase();