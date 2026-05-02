const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  port: 21840,
  user: 'root',
  password: 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: 'ecommerce_mascotas',
  connectTimeout: 30000
};

async function setup() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado');

    // Agregar columna tipo si no existe
    try {
      await connection.execute(`ALTER TABLE productos ADD COLUMN tipo ENUM('normal','2x1','importado') DEFAULT 'normal'`);
      console.log('✅ Columna tipo agregada');
    } catch (e) {
      console.log('⚠️ Columna tipo ya existe');
    }

    // Obtener categoria_id de juguetes, collares, otros
    const [cats] = await connection.execute('SELECT id, nombre FROM categorias');
    const catMap = {};
    cats.forEach(c => catMap[c.nombre] = c.id);

    const juguetes = catMap['juguetes'] || 1;
    const collares = catMap['collares'] || 1;
    const camas = catMap['camas'] || 1;
    const otros = catMap['otros'] || 1;
    const comederos = catMap['comederos'] || 1;

    // Productos 2x1
    const productos2x1 = [
      ['Snack Dental para Perros 2x1', 'Snack dental que limpia los dientes de tu perro. Llevá 2 al precio de 1.', 8500, juguetes, '2x1', 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&h=500&fit=crop', 50],
      ['Juguete Cuerda Resistente 2x1', 'Juguete de cuerda para perros medianos y grandes. Oferta 2x1.', 6900, juguetes, '2x1', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop', 40],
      ['Arena para Gatos Premium 2x1', 'Arena aglomerante con control de olores. Llevá 2 bolsas al precio de 1.', 12000, otros, '2x1', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop', 30],
      ['Shampoo para Mascotas 2x1', 'Shampoo suave con aloe vera para perros y gatos. Promo 2x1.', 7500, otros, '2x1', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop', 60],
    ];

    // Productos importados
    const productosImportados = [
      ['Kong Classic USA', 'El juguete más famoso del mundo para perros. Importado directo de USA. Rellená con premios.', 18500, juguetes, 'importado', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop', 25],
      ['Collar Ruffwear Importado', 'Collar de alta resistencia para aventuras al aire libre. Importado de USA.', 32000, collares, 'importado', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop', 20],
      ['Cama Orthopedic PetFusion USA', 'Cama ortopédica con memory foam importada. Ideal para perros con artritis.', 65000, camas, 'importado', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop', 15],
      ['Comedero Automático Petlibro', 'Comedero automático programable importado de USA con cámara HD integrada.', 95000, comederos, 'importado', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop', 10],
    ];

    for (const [nombre, descripcion, precio, categoria_id, tipo, imagen, stock] of [...productos2x1, ...productosImportados]) {
      await connection.execute(
        `INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen, tipo, stock, activo, descuento_porcentaje)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)`,
        [nombre, descripcion, precio, categoria_id, imagen, tipo, stock]
      );
      console.log(`✅ Creado: ${nombre}`);
    }

    console.log('\n🎉 Listo! Productos creados correctamente.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setup();
