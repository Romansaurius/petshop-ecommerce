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
const sectionsRoutes = require('./routes/sectionsRoutes');
const shippingRoutes = require('./routes/shippingRoutes');

const db = require('./config/database');

async function addColumnIfNotExists(table, column, definition) {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch (e) {
    if (!e.message.includes('Duplicate column name')) throw e;
  }
}

async function ensureDbColumns() {
  try {
    await addColumnIfNotExists('usuarios', 'role', "ENUM('user','admin') DEFAULT 'user'");
    await addColumnIfNotExists('usuarios', 'two_factor_enabled', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists('usuarios', 'two_factor_code', 'VARCHAR(6) DEFAULT NULL');
    await addColumnIfNotExists('usuarios', 'two_factor_expires', 'DATETIME DEFAULT NULL');
    await addColumnIfNotExists('usuarios', 'reset_token', 'VARCHAR(64) DEFAULT NULL');
    await addColumnIfNotExists('usuarios', 'reset_token_expires', 'DATETIME DEFAULT NULL');
    await addColumnIfNotExists('usuarios', 'compras_realizadas', 'INT DEFAULT 0');
    await addColumnIfNotExists('usuarios', 'puntos', 'INT DEFAULT 0');
    await addColumnIfNotExists('usuarios', 'puntos_historicos', 'INT DEFAULT 0');
    await addColumnIfNotExists('usuarios', 'nivel', "VARCHAR(20) DEFAULT 'normal'");
    await addColumnIfNotExists('usuarios', 'nivel_expira', 'DATETIME NULL');
    await addColumnIfNotExists('productos', 'tipo', "VARCHAR(50) DEFAULT 'normal'");
    await addColumnIfNotExists('productos', 'tiene_talles', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists('pedidos', 'nombre_contacto', "VARCHAR(255) DEFAULT ''");
    await addColumnIfNotExists('pedidos', 'costo_envio', 'DECIMAL(10,2) DEFAULT 0');
    await addColumnIfNotExists('pedidos', 'metodo_envio', "VARCHAR(100) DEFAULT ''");
    await addColumnIfNotExists('pedidos', 'cp_alerta', "VARCHAR(20) DEFAULT NULL");
    await addColumnIfNotExists('pedidos', 'cupon_codigo', "VARCHAR(50) DEFAULT NULL");
    await addColumnIfNotExists('shipping_zones', 'monto_envio_gratis', 'DECIMAL(10,2) DEFAULT NULL');
    try { await db.execute(`ALTER TABLE detalles_pedido MODIFY COLUMN nombre_producto VARCHAR(255) DEFAULT ''`); } catch(e) {}
    try { await db.execute(`ALTER TABLE canjes MODIFY COLUMN tipo VARCHAR(30) DEFAULT 'porcentaje'`); } catch(e) {}
    console.log('Columnas DB verificadas');
  } catch (e) {
    console.log('DB columns check error:', e.message);
  }

  // Tablas auxiliares
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS home_secciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        clave VARCHAR(50) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        orden INT DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS home_seccion_productos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        seccion_id INT NOT NULL,
        producto_id INT NOT NULL,
        orden INT DEFAULT 0,
        FOREIGN KEY (seccion_id) REFERENCES home_secciones(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      )
    `);
    const [[{sc2}]] = await db.execute('SELECT COUNT(*) as sc2 FROM home_secciones');
    if (sc2 === 0) {
      await db.execute(`INSERT INTO home_secciones (clave, nombre, orden) VALUES
        ('lanzamientos', 'Lanzamientos Exclusivos', 1),
        ('natural', 'Nuestra Selección Natural', 2),
        ('camas', 'El descanso que se merece', 3),
        ('juguetes', 'Ideales para los más juguetones', 4)`);
    }
  } catch (e) { console.log('home_secciones:', e.message); }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS producto_variantes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        producto_id INT NOT NULL,
        talla VARCHAR(10) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 100,
        activo BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      )
    `);
  } catch (e) { console.log('producto_variantes:', e.message); }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS canjes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        puntos_requeridos INT NOT NULL,
        categoria ENUM('normal','gold','platinum') DEFAULT 'normal',
        tipo VARCHAR(30) DEFAULT 'porcentaje',
        valor_descuento DECIMAL(10,2) DEFAULT 0,
        tope_descuento DECIMAL(10,2) DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE,
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
    const [[{count}]] = await db.execute('SELECT COUNT(*) as count FROM canjes');
    if (count === 0) {
      const canjes = [
        ['Cepillo Vaporizador para Perros y Gatos','Cepillo vaporizador profesional.',300,'normal','producto',0,0],
        ['Pelota Inteligente para Perros','Pelota interactiva para tu perro.',500,'normal','producto',0,0],
        ['15% OFF en toda la tienda','Descuento 15%. Uso unico. Tope $12.500.',750,'normal','descuento',15,12500],
        ['Acceso Gold por 30 dias','5% OFF pasivo en compras (tope $7.500).',1000,'gold','servicio',5,7500],
        ['30% OFF en toda la tienda','Descuento 30%. Uso unico. Tope $20.000.',1250,'gold','descuento',30,20000],
        ['Rascador con Descanso en Altura','Rascador premium con escondite para gatos.',1500,'gold','producto',0,0],
        ['Bano de Peluqueria Canina Completo','Bano completo. Sujeto a disponibilidad.',1750,'platinum','servicio',0,0],
        ['Rascador con Descanso en Altura','Rascador premium con escondite.',1750,'platinum','producto',0,0],
        ['3 Dias Gratis de Hoteleria Canina','3 dias de guarderia. Sujeto a disponibilidad.',2000,'platinum','servicio',0,0],
        ['Cama Nordica Talle M','Cama nordica para mascotas medianas.',2000,'platinum','producto',0,0],
        ['Cama Nordica Talle L','Cama nordica para mascotas grandes.',2500,'platinum','producto',0,0],
        ['Cama Nordica Talle XL','Cama nordica para mascotas extra grandes.',3000,'platinum','producto',0,0],
      ];
      for (const c of canjes) {
        await db.execute('INSERT INTO canjes (nombre,descripcion,puntos_requeridos,categoria,tipo,valor_descuento,tope_descuento) VALUES (?,?,?,?,?,?,?)', c);
      }
    }
  } catch (e) { console.log('canjes:', e.message); }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cupones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        codigo VARCHAR(50) NOT NULL UNIQUE,
        nombre VARCHAR(200) NOT NULL,
        tipo ENUM('porcentaje','monto_fijo') DEFAULT 'monto_fijo',
        valor DECIMAL(10,2) NOT NULL,
        fecha_expiracion DATE DEFAULT NULL,
        usos_maximos INT DEFAULT NULL,
        usos_actuales INT DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) { console.log('cupones:', e.message); }

  // Tablas de shipping — bloque independiente
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS shipping_zones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS shipping_cities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        provincia VARCHAR(100) DEFAULT '',
        shipping_zone_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shipping_zone_id) REFERENCES shipping_zones(id) ON DELETE RESTRICT
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS shipping_config (
        id INT PRIMARY KEY DEFAULT 1,
        envio_gratis_activo BOOLEAN DEFAULT FALSE,
        monto_envio_gratis DECIMAL(10,2) DEFAULT 50000,
        retiro_local_activo BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    const [[{sc}]] = await db.execute('SELECT COUNT(*) as sc FROM shipping_config');
    if (sc === 0) {
      await db.execute('INSERT INTO shipping_config (id, envio_gratis_activo, monto_envio_gratis, retiro_local_activo) VALUES (1, FALSE, 50000, TRUE)');
    }
    const [[{sz}]] = await db.execute('SELECT COUNT(*) as sz FROM shipping_zones');
    if (sz === 0) {
      await db.execute(`INSERT INTO shipping_zones (nombre, precio) VALUES
        ('Zona Norte', 3500),
        ('CABA', 6000),
        ('AMBA', 7000),
        ('Interior de Buenos Aires', 8000),
        ('Interior del País', 9500)`);
      const [[z1row]] = await db.execute("SELECT id FROM shipping_zones WHERE nombre='Zona Norte' LIMIT 1");
      const [[z2row]] = await db.execute("SELECT id FROM shipping_zones WHERE nombre='CABA' LIMIT 1");
      const [[z3row]] = await db.execute("SELECT id FROM shipping_zones WHERE nombre='AMBA' LIMIT 1");
      const z1 = z1row.id, z2 = z2row.id, z3 = z3row.id;
      await db.execute(`INSERT INTO shipping_cities (nombre, provincia, shipping_zone_id) VALUES
        ('Malvinas Argentinas', 'Buenos Aires', ?),
        ('Pilar', 'Buenos Aires', ?),
        ('Escobar', 'Buenos Aires', ?),
        ('San Miguel', 'Buenos Aires', ?)`, [z1, z1, z1, z1]);
      await db.execute(`INSERT INTO shipping_cities (nombre, provincia, shipping_zone_id) VALUES ('CABA', 'Ciudad Autónoma de Buenos Aires', ?)`, [z2]);
      await db.execute(`INSERT INTO shipping_cities (nombre, provincia, shipping_zone_id) VALUES
        ('La Plata', 'Buenos Aires', ?),
        ('Quilmes', 'Buenos Aires', ?),
        ('Lomas de Zamora', 'Buenos Aires', ?)`, [z3, z3, z3]);
    }
    console.log('Tablas shipping OK');
  } catch (e) { console.log('shipping tables error:', e.message); }
}
ensureDbColumns();

const app = express();
const PORT = process.env.PORT || 10000;

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
app.use('/api/sections', sectionsRoutes);
app.use('/api/shipping', shippingRoutes);

// Catch all handler - debe ir al final
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});