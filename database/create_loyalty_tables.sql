-- Crear tablas de fidelización
USE ecommerce_mascotas;

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS cupones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('monto_fijo', 'porcentaje') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    fecha_expiracion DATE NULL,
    usos_maximos INT NULL,
    usos_actuales INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de programas de fidelización
CREATE TABLE IF NOT EXISTS programas_fidelizacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    compras_requeridas INT NOT NULL,
    recompensa VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de progreso de usuarios en programas
CREATE TABLE IF NOT EXISTS usuario_programa_progreso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    programa_id INT NOT NULL,
    compras_realizadas INT DEFAULT 0,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (programa_id) REFERENCES programas_fidelizacion(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_programa (usuario_id, programa_id)
);

-- Agregar columna cupon_id a pedidos si no existe
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cupon_id INT NULL;
ALTER TABLE pedidos ADD FOREIGN KEY IF NOT EXISTS (cupon_id) REFERENCES cupones(id);

-- Insertar datos de ejemplo
INSERT IGNORE INTO programas_fidelizacion (nombre, descripcion, compras_requeridas, recompensa) VALUES
('Cliente Frecuente', 'Programa para clientes que realizan compras regulares', 5, '10% de descuento en la próxima compra'),
('Cliente VIP', 'Programa exclusivo para nuestros mejores clientes', 10, '20% de descuento + envío gratis'),
('Amante de Mascotas', 'Para los verdaderos amantes de las mascotas', 15, '25% de descuento + regalo sorpresa');

INSERT IGNORE INTO cupones (codigo, nombre, tipo, valor, fecha_expiracion) VALUES
('BIENVENIDO20', 'Descuento de Bienvenida', 'porcentaje', 20.00, '2024-12-31'),
('ENVIOGRATIS', 'Envío Gratis', 'monto_fijo', 1500.00, '2024-12-31'),
('MASCOTAS15', 'Descuento Mascotas', 'porcentaje', 15.00, NULL);