-- Script para actualizar la base de datos existente
USE ecommerce_mascotas;

-- Crear tabla de categorías si no existe
CREATE TABLE IF NOT EXISTS categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de marcas si no existe
CREATE TABLE IF NOT EXISTS marcas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de imágenes de productos si no existe
CREATE TABLE IF NOT EXISTS producto_imagenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  imagen_url VARCHAR(500) NOT NULL,
  es_principal BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Insertar categorías básicas
INSERT IGNORE INTO categorias (nombre, descripcion) VALUES
('comederos', 'Comederos y bebederos para mascotas'),
('juguetes', 'Juguetes y entretenimiento para mascotas'),
('camas', 'Camas y descanso para mascotas'),
('collares', 'Collares, correas y accesorios'),
('rascadores', 'Rascadores y torres para gatos'),
('otros', 'Otros productos para mascotas');

-- Agregar columnas faltantes a la tabla productos si no existen
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS descripcion_corta TEXT,
ADD COLUMN IF NOT EXISTS precio_oferta DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS categoria_id INT,
ADD COLUMN IF NOT EXISTS marca_id INT,
ADD COLUMN IF NOT EXISTS imagenes JSON,
ADD COLUMN IF NOT EXISTS descuento_porcentaje INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Actualizar stock por defecto si es 0
UPDATE productos SET stock = 100 WHERE stock = 0;

-- Migrar categorías existentes de ENUM a tabla de categorías
UPDATE productos p 
JOIN categorias c ON p.categoria = c.nombre 
SET p.categoria_id = c.id 
WHERE p.categoria_id IS NULL;

-- Agregar foreign keys si no existen
ALTER TABLE productos 
ADD CONSTRAINT IF NOT EXISTS fk_productos_categoria 
FOREIGN KEY (categoria_id) REFERENCES categorias(id);

ALTER TABLE productos 
ADD CONSTRAINT IF NOT EXISTS fk_productos_marca 
FOREIGN KEY (marca_id) REFERENCES marcas(id);