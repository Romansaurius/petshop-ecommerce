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
  const alterTable = async (query, description) => {
    try {
      await db.execute(query);
      console.log(`  ✅ ${description}`);
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log(`  ⚠️ Columna ya existe`);
      } else {
        console.log(`  ❌ ${description}: ${error.message}`);
      }
    }
  };

  try {
    // Usuarios
    await alterTable(`ALTER TABLE usuarios ADD COLUMN role VARCHAR(20) DEFAULT 'user'`, 'Columna role agregada');
    await alterTable(`ALTER TABLE usuarios ADD COLUMN compras_realizadas INT DEFAULT 0`, 'Columna compras_realizadas agregada');
    await alterTable(`ALTER TABLE usuarios ADD COLUMN puntos INT DEFAULT 0`, 'Columna puntos agregada');
    await alterTable(`ALTER TABLE usuarios ADD COLUMN puntos_historicos INT DEFAULT 0`, 'Columna puntos_historicos agregada');
    await alterTable(`ALTER TABLE usuarios ADD COLUMN nivel VARCHAR(20) DEFAULT 'normal'`, 'Columna nivel agregada');
    await alterTable(`ALTER TABLE usuarios ADD COLUMN nivel_expira DATETIME NULL`, 'Columna nivel_expira agregada');
    
    // Productos
    await alterTable(`ALTER TABLE productos ADD COLUMN tipo VARCHAR(50) DEFAULT 'normal'`, 'Columna tipo agregada');
    
    // Canjes y canjes_usuario
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