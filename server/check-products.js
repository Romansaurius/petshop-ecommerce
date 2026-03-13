const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  port: 21840,
  user: 'root',
  password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: 'ecommerce_mascotas'
};

async function checkProducts() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Conexión exitosa\n');
    
    // Verificar todos los productos (activos e inactivos)
    console.log('📦 TODOS LOS PRODUCTOS:');
    const [allProducts] = await connection.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.activo,
        p.stock,
        p.destacado,
        c.nombre as categoria,
        m.nombre as marca,
        p.created_at,
        p.updated_at
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      ORDER BY p.created_at DESC
    `);
    
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nombre}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Precio: $${product.precio}`);
      console.log(`   Categoría: ${product.categoria || 'Sin categoría'}`);
      console.log(`   Marca: ${product.marca || 'Sin marca'}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Activo: ${product.activo ? 'SÍ' : 'NO'}`);
      console.log(`   Destacado: ${product.destacado ? 'SÍ' : 'NO'}`);
      console.log(`   Creado: ${product.created_at}`);
      console.log(`   Actualizado: ${product.updated_at}`);
      console.log('   ---');
    });
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`Total productos: ${allProducts.length}`);
    
    const activeProducts = allProducts.filter(p => p.activo);
    console.log(`Productos activos: ${activeProducts.length}`);
    
    const inactiveProducts = allProducts.filter(p => !p.activo);
    console.log(`Productos inactivos: ${inactiveProducts.length}`);
    
    const featuredProducts = allProducts.filter(p => p.destacado);
    console.log(`Productos destacados: ${featuredProducts.length}`);
    
    // Verificar productos creados recientemente (últimas 24 horas)
    const recentProducts = allProducts.filter(p => {
      const createdAt = new Date(p.created_at);
      const now = new Date();
      const diffHours = (now - createdAt) / (1000 * 60 * 60);
      return diffHours <= 24;
    });
    
    console.log(`Productos creados en las últimas 24h: ${recentProducts.length}`);
    
    if (recentProducts.length > 0) {
      console.log('\n🆕 PRODUCTOS RECIENTES:');
      recentProducts.forEach(product => {
        console.log(`- ${product.nombre} (${product.activo ? 'ACTIVO' : 'INACTIVO'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkProducts();