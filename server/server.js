const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const db = require('./config/database');

// Asegurar columnas necesarias en la DB al arrancar
async function ensureDbColumns() {
  try {
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role ENUM('user','admin') DEFAULT 'user'`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS compras_realizadas INT DEFAULT 0`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos INT DEFAULT 0`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos_historicos INT DEFAULT 0`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel VARCHAR(20) DEFAULT 'normal'`);
    await db.execute(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel_expira DATETIME NULL`);
    await db.execute(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'normal'`);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS canjes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        puntos_requeridos INT NOT NULL,
        categoria ENUM('normal','gold','platinum') DEFAULT 'normal',
        tipo ENUM('producto','descuento','servicio') DEFAULT 'producto',
        valor_descuento INT DEFAULT 0,
        tope_descuento DECIMAL(10,2) DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE,
        stock INT DEFAULT -1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS canjes_usuario (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        canje_id INT NOT NULL,
        puntos_gastados INT NOT NULL,
        estado ENUM('pendiente','procesando','completado','cancelado') DEFAULT 'pendiente',
        codigo VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (canje_id) REFERENCES canjes(id)
      )
    `);
    // Insertar canjes solo si la tabla está vacía
    const [[{count}]] = await db.execute(`SELECT COUNT(*) as count FROM canjes`);
    if (count === 0) {
      const canjes = [
        ['Cepillo Vaporizador para Perros y Gatos', 'Cepillo vaporizador profesional para el cuidado del pelaje.', 300, 'normal', 'producto', 0, 0],
        ['Pelota Inteligente para Perros', 'Pelota interactiva que estimula el juego y la actividad física.', 500, 'normal', 'producto', 0, 0],
        ['15% OFF en toda la tienda', 'Descuento del 15% en tu próxima compra. Uso único. Tope $12.500.', 750, 'normal', 'descuento', 15, 12500],
        ['Acceso Gold por 30 días', 'Beneficios Gold: 5% OFF pasivo en compras (tope $7.500) y precios especiales.', 1000, 'gold', 'servicio', 5, 7500],
        ['30% OFF en toda la tienda', 'Descuento del 30% en tu próxima compra. Uso único. Tope $20.000.', 1250, 'gold', 'descuento', 30, 20000],
        ['Rascador con Descanso en Altura + Escondite', 'Rascador premium con zona de descanso elevada y escondite para gatos.', 1500, 'gold', 'producto', 0, 0],
        ['Baño de Peluquería Canina Completo', 'Baño completo en nuestra peluquería. Sujeto a disponibilidad.', 1750, 'platinum', 'servicio', 0, 0],
        ['Rascador con Descanso en Altura + Escondite', 'Rascador premium con zona de descanso elevada y escondite.', 1750, 'platinum', 'producto', 0, 0],
        ['3 Días Gratis de Hotelería Canina', '3 días de guardería para tu mascota. Sujeto a disponibilidad.', 2000, 'platinum', 'servicio', 0, 0],
        ['Cama Nórdica Talle M', 'Cama nórdica ultra confortable para mascotas medianas.', 2000, 'platinum', 'producto', 0, 0],
        ['Cama Nórdica Talle L', 'Cama nórdica ultra confortable para mascotas grandes.', 2500, 'platinum', 'producto', 0, 0],
        ['Cama Nórdica Talle XL', 'Cama nórdica ultra confortable para mascotas extra grandes.', 3000, 'platinum', 'producto', 0, 0],
      ];
      for (const c of canjes) {
        await db.execute(
          `INSERT INTO canjes (nombre, descripcion, puntos_requeridos, categoria, tipo, valor_descuento, tope_descuento) VALUES (?, ?, ?, ?, ?, ?, ?)`, c
        );
      }
    }
    console.log('✅ Columnas DB verificadas');
  } catch (e) {
    console.log('DB columns check:', e.message);
  }
}
ensureDbColumns();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Crear directorio uploads si no existe
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/upload', uploadRoutes);

// Catch all handler - debe ir al final
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});