require('dotenv').config();
const db = require('./config/database');

async function check() {
  try {
    const [cols] = await db.execute('DESCRIBE pedidos');
    console.log('Columnas en pedidos:');
    cols.forEach(c => console.log(`  ${c.Field}: ${c.Type}`));

    const [orders] = await db.execute('SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 5');
    console.log(`\nUltimos ${orders.length} pedidos:`);
    orders.forEach(o => console.log(JSON.stringify(o)));
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

check();
