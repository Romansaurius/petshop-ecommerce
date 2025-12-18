-- Migración completa para ecommerce de mascotas
-- Ejecutar en orden

-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS ecommerce_mascotas;
USE ecommerce_mascotas;

-- 2. Crear tablas (importar desde schema.sql)
-- 3. Insertar datos (importar desde productos.sql)

-- Verificación
SELECT 'Migración completada' as status;