const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu',
  database: process.env.DB_NAME || 'ecommerce_mascotas',
};

async function addPoints() {
  const conn = await mysql.createConnection(dbConfig);

  // Buscar usuario
  const [users] = await conn.execute(
    "SELECT id, nombre, email FROM usuarios WHERE email LIKE '%ranuccimanro07%'"
  );

  if (!users.length) {
    console.log('❌ Usuario no encontrado');
    await conn.end();
    return;
  }

  const user = users[0];
  console.log(`✅ Usuario encontrado: ${user.nombre} (${user.email}) — ID: ${user.id}`);

  // Ver si ya tiene fila en loyalty
  const [loyalty] = await conn.execute(
    'SELECT * FROM loyalty_puntos WHERE usuario_id = ?', [user.id]
  );

  if (loyalty.length) {
    await conn.execute(
      'UPDATE loyalty_puntos SET puntos = puntos + 1500, puntos_historicos = puntos_historicos + 1500 WHERE usuario_id = ?',
      [user.id]
    );
  } else {
    await conn.execute(
      'INSERT INTO loyalty_puntos (usuario_id, puntos, puntos_historicos) VALUES (?, 1500, 1500)',
      [user.id]
    );
  }

  // Registrar en historial
  await conn.execute(
    "INSERT INTO loyalty_historial (usuario_id, tipo, puntos, descripcion) VALUES (?, 'suma', 1500, 'Carga manual de puntos por administración')",
    [user.id]
  );

  const [updated] = await conn.execute(
    'SELECT puntos, puntos_historicos FROM loyalty_puntos WHERE usuario_id = ?', [user.id]
  );
  console.log(`✅ Puntos actualizados:`, updated[0]);

  await conn.end();
}

addPoints().catch(console.error);
