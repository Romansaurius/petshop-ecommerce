-- Agregar tabla para múltiples imágenes por producto
CREATE TABLE IF NOT EXISTS producto_imagenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  imagen_url VARCHAR(500) NOT NULL,
  cloudinary_id VARCHAR(255),
  es_principal BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Agregar índices para mejor rendimiento
CREATE INDEX idx_producto_imagenes_producto_id ON producto_imagenes(producto_id);
CREATE INDEX idx_producto_imagenes_principal ON producto_imagenes(producto_id, es_principal);