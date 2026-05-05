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
    await db.execute(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'normal'`);
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