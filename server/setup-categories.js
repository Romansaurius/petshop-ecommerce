const db = require('./config/database');

async function setupCategories() {
  try {
    console.log('🔄 Configurando categorías...');
    
    const categories = [
      'comederos',
      'juguetes', 
      'camas',
      'collares',
      'rascadores',
      'otros'
    ];
    
    for (const category of categories) {
      await db.execute(
        'INSERT IGNORE INTO categorias (nombre) VALUES (?)',
        [category]
      );
    }
    
    const [result] = await db.execute('SELECT COUNT(*) as count FROM categorias');
    console.log(`✅ Categorías configuradas: ${result[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupCategories();