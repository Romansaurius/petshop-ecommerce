-- Migración: agregar columnas de loyalty y cupones a pedidos y usuarios
USE ecommerce_mascotas;

-- Columnas en pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS nombre_contacto VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS costo_envio DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metodo_envio VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cp_alerta VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cupon_codigo VARCHAR(50) DEFAULT NULL;

-- Columnas de puntos y nivel en usuarios
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS puntos INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS puntos_historicos INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nivel ENUM('normal','gold','platinum') DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS nivel_expira DATETIME DEFAULT NULL;

-- Tabla de canjes disponibles
CREATE TABLE IF NOT EXISTS canjes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  puntos_requeridos INT NOT NULL,
  categoria ENUM('normal','gold','platinum') DEFAULT 'normal',
  tipo ENUM('porcentaje','monto_fijo','envio_gratis','nivel') DEFAULT 'porcentaje',
  valor_descuento DECIMAL(10,2) DEFAULT 0,
  tope_descuento DECIMAL(10,2) DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de canjes realizados por usuarios
CREATE TABLE IF NOT EXISTS canjes_usuario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  canje_id INT NOT NULL,
  puntos_gastados INT NOT NULL,
  codigo VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (canje_id) REFERENCES canjes(id)
);

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS cupones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo ENUM('monto_fijo','porcentaje') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  fecha_expiracion DATE NULL,
  usos_maximos INT NULL,
  usos_actuales INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
