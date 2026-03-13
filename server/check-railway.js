const mysql = require('mysql2/promise');

async function checkRailway() {
  try {
    console.log('🔄 Verificando Railway...');
    
    const connection = await mysql.createConnection({
      host: 'shuttle.proxy.rlwy.net',
      port: 21840,
      user: 'root',
      password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
      database: 'ecommerce_mascotas',
      connectTimeout: 10000
    });
    
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Railway está funcionando');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Railway no responde:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verificar en railway.app si el servicio está activo');
    console.log('2. Reiniciar el servicio desde el dashboard');
    console.log('3. Usar una base de datos local temporal');
  }
}

checkRailway();