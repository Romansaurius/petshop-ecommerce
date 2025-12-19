-- Script para actualizar la tabla usuarios existente
USE ecommerce_mascotas;

-- Agregar columnas si no existen
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user',
ADD COLUMN IF NOT EXISTS compras_realizadas INT DEFAULT 0;

-- Insertar usuario admin si no existe
INSERT IGNORE INTO usuarios (nombre, email, password, role) VALUES 
('Administrador', 'admin@petshop.com', '$2a$10$srlVoZ.QDTB12ChfJc.vPe7XeTb4wqJ2.HMrz5PqaCv0OVvHndy8y', 'admin');

-- Verificar estructura
DESCRIBE usuarios;