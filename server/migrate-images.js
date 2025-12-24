const db = require('./config/database');

async function migrateMultipleImages() {
  try {
    console.log('🔄 Iniciando migración de múltiples imágenes...');

    // Agregar columna imagenes si no existe
    try {
      await db.execute('ALTER TABLE productos ADD COLUMN imagenes JSON AFTER imagen');
      console.log('✅ Columna imagenes agregada');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columna imagenes ya existe');
      } else {
        throw error;
      }
    }

    // Migrar imágenes existentes al nuevo formato
    await db.execute(`
      UPDATE productos 
      SET imagenes = JSON_ARRAY(imagen) 
      WHERE imagen IS NOT NULL AND imagen != '' AND (imagenes IS NULL OR JSON_LENGTH(imagenes) = 0)
    `);
    console.log('✅ Imágenes existentes migradas');

    // Los productos sin imagen tendrán un array vacío
    await db.execute(`
      UPDATE productos 
      SET imagenes = JSON_ARRAY() 
      WHERE (imagen IS NULL OR imagen = '') AND (imagenes IS NULL OR JSON_LENGTH(imagenes) = 0)
    `);
    console.log('✅ Productos sin imagen actualizados');

    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrateMultipleImages();