-- Agregar monto_minimo y descuento_maximo a cupones
ALTER TABLE cupones
  ADD COLUMN IF NOT EXISTS monto_minimo DECIMAL(10,2) DEFAULT NULL COMMENT 'Monto mínimo de compra para aplicar el cupón',
  ADD COLUMN IF NOT EXISTS descuento_maximo DECIMAL(10,2) DEFAULT NULL COMMENT 'Tope máximo de descuento en pesos (para cupones de porcentaje)';
