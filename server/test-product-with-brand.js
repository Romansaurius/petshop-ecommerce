const mysql = require('mysql2/promise');

async function testProductWithBrand() {
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
    
    // Verificar marcas existentes
    const [existingBrands] = await connection.execute('SELECT * FROM marcas');
    console.log('🏷️ Marcas existentes:', existingBrands);
    
    // Crear una marca nueva si no existe
    const brandName = 'Royal Canin';
    let [brandRows] = await connection.execute('SELECT id FROM marcas WHERE nombre = ?', [brandName]);
    let brandId = brandRows[0]?.id;
    
    if (!brandId) {
      const [newBrand] = await connection.execute('INSERT INTO marcas (nombre) VALUES (?)', [brandName]);
      brandId = newBrand.insertId;
      console.log('✅ Marca creada:', brandName, 'ID:', brandId);
    } else {
      console.log('ℹ️ Marca ya existe:', brandName, 'ID:', brandId);
    }
    
    // Crear producto con marca
    const [result] = await connection.execute(`
      INSERT INTO productos (nombre, descripcion, precio, categoria_id, marca_id, destacado, descuento_porcentaje, stock, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Alimento Premium para Perros',
      'Alimento balanceado de alta calidad',
      45999.99,
      1, // comederos
      brandId,
      0,
      0,
      50,
      1
    ]);
    
    console.log('✅ Producto con marca creado, ID:', result.insertId);
    
    // Verificar el producto creado con JOIN
    const [products] = await connection.execute(`
      SELECT p.*, c.nombre as categoria, m.nombre as marca
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.id = ?
    `, [result.insertId]);
    
    console.log('📦 Producto completo:', products[0]);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductWithBrand();