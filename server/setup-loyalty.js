const db = require('./config/database');

async function setupLoyalty() {
  try {
    // Agregar columnas a usuarios
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos INT DEFAULT 0`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos_historicos INT DEFAULT 0`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel VARCHAR(20) DEFAULT 'normal'`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel_expira DATETIME NULL`);
    console.log('✅ Columnas de usuarios actualizadas');

    // Tabla de canjes disponibles
    await db.execute(`
      CREATE TABLE IF NOT EXISTS canjes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        puntos_requeridos INT NOT NULL,
        categoria ENUM('normal', 'gold', 'platinum') DEFAULT 'normal',
        tipo ENUM('producto', 'descuento', 'servicio') DEFAULT 'producto',
        valor_descuento INT DEFAULT 0,
        tope_descuento DECIMAL(10,2) DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE,
        stock INT DEFAULT -1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla canjes creada');

    // Tabla historial de canjes por usuario
    await db.execute(`
      CREATE TABLE IF NOT EXISTS canjes_usuario (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        canje_id INT NOT NULL,
        puntos_gastados INT NOT NULL,
        estado ENUM('pendiente', 'procesando', 'completado', 'cancelado') DEFAULT 'pendiente',
        codigo VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (canje_id) REFERENCES canjes(id)
      )
    `);
    console.log('✅ Tabla canjes_usuario creada');

    // Insertar canjes iniciales
    await db.execute(`DELETE FROM canjes`);

    const canjes = [
      // NORMAL
      ['Cepillo Vaporizador para Perros y Gatos', 'Cepillo vaporizador profesional para el cuidado del pelaje de tu mascota.', 300, 'normal', 'producto', 0, 0],
      ['Pelota Inteligente para Perros', 'Pelota interactiva que estimula el juego y la actividad física de tu perro.', 500, 'normal', 'producto', 0, 0],
      ['15% OFF en toda la tienda', 'Descuento del 15% en tu próxima compra. Uso único. Tope $12.500.', 750, 'normal', 'descuento', 15, 12500],
      // GOLD
      ['Acceso Gold por 30 días', 'Desbloqueá todos los beneficios Gold: 5% OFF pasivo en compras (tope $7.500) y acceso a productos con precio Gold.', 1000, 'gold', 'servicio', 5, 7500],
      ['30% OFF en toda la tienda', 'Descuento del 30% en tu próxima compra. Uso único. Tope $20.000.', 1250, 'gold', 'descuento', 30, 20000],
      ['Rascador con Descanso en Altura + Escondite', 'Rascador premium con zona de descanso elevada y escondite para gatos.', 1500, 'gold', 'producto', 0, 0],
      // PLATINUM
      ['Baño de Peluquería Canina Completo', 'Baño completo en nuestra peluquería canina. Sujeto a disponibilidad. Consultá zonas de cobertura.', 1750, 'platinum', 'servicio', 0, 0],
      ['Rascador con Descanso en Altura + Escondite', 'Rascador premium con zona de descanso elevada y escondite para gatos.', 1750, 'platinum', 'producto', 0, 0],
      ['3 Días Gratis de Hotelería Canina', '3 días de guardería/hotelería para tu mascota. Sujeto a disponibilidad. Razas grandes consultar.', 2000, 'platinum', 'servicio', 0, 0],
      ['Cama Nórdica Talle M', 'Cama nórdica ultra confortable para mascotas medianas.', 2000, 'platinum', 'producto', 0, 0],
      ['Cama Nórdica Talle L', 'Cama nórdica ultra confortable para mascotas grandes.', 2500, 'platinum', 'producto', 0, 0],
      ['Cama Nórdica Talle XL', 'Cama nórdica ultra confortable para mascotas extra grandes.', 3000, 'platinum', 'producto', 0, 0],
    ];

    for (const c of canjes) {
      await db.execute(
        `INSERT INTO canjes (nombre, descripcion, puntos_requeridos, categoria, tipo, valor_descuento, tope_descuento) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        c
      );
    }
    console.log('✅ Canjes insertados');
    console.log('🎉 Sistema de fidelización listo');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

setupLoyalty();
