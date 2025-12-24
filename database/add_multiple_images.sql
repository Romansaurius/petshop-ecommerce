-- Agregar columna para múltiples imágenes
ALTER TABLE productos ADD COLUMN imagenes JSON AFTER imagen;

-- Migrar imágenes existentes al nuevo formato
UPDATE productos 
SET imagenes = JSON_ARRAY(imagen) 
WHERE imagen IS NOT NULL AND imagen != '';

-- Los productos sin imagen tendrán un array vacío
UPDATE productos 
SET imagenes = JSON_ARRAY() 
WHERE imagen IS NULL OR imagen = '';