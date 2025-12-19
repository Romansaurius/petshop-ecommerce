-- Insertar usuario administrador
USE ecommerce_mascotas;

INSERT INTO usuarios (nombre, email, password, role) VALUES 
('Administrador', 'admin@petshop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- La contraseña hasheada corresponde a: Ranucci2007:)Roman2007