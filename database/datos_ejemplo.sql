USE ecommerce_mascotas;

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, imagen) VALUES
('comederos', 'Comederos automáticos y tradicionales', '/images/cat-comederos.jpg'),
('juguetes', 'Juguetes interactivos y tradicionales', '/images/cat-juguetes.jpg'),
('camas', 'Camas y colchones para mascotas', '/images/cat-camas.jpg'),
('collares', 'Collares, correas y accesorios', '/images/cat-collares.jpg'),
('rascadores', 'Rascadores y torres para gatos', '/images/cat-rascadores.jpg'),
('otros', 'Otros productos para mascotas', '/images/cat-otros.jpg');

-- Insertar marcas
INSERT INTO marcas (nombre, descripcion) VALUES
('PetTech', 'Tecnología avanzada para mascotas'),
('ComfortPet', 'Comodidad y bienestar animal'),
('PlayTime', 'Diversión garantizada para tu mascota'),
('SafePet', 'Seguridad y protección'),
('NaturalPet', 'Productos naturales y ecológicos');

-- Insertar productos
INSERT INTO productos (nombre, descripcion, descripcion_corta, precio, precio_oferta, categoria_id, marca_id, sku, destacado, fecha_lanzamiento) VALUES
('Comedero Automático Wi-Fi Premium', 
 'Comedero inteligente con conectividad Wi-Fi, programación por horarios, control remoto desde app móvil, cámara integrada y dispensador de agua. Ideal para mantener a tu mascota alimentada incluso cuando no estás en casa.',
 'Comedero inteligente Wi-Fi con app móvil y cámara',
 89999.00, 79999.00, 1, 1, 'CAW-PREM-001', TRUE, '2024-01-15'),

('Comedero Automático Wi-Fi Básico',
 'Comedero automático con conectividad Wi-Fi y programación básica. Perfecto para horarios regulares de alimentación con control desde tu smartphone.',
 'Comedero automático Wi-Fi con programación básica',
 59999.00, NULL, 1, 1, 'CAW-BAS-001', TRUE, '2024-02-01'),

('Juguete Interactivo Láser para Gatos',
 'Juguete automático con láser que se mueve aleatoriamente para mantener a tu gato activo y entretenido. Incluye sensor de movimiento y temporizador automático.',
 'Juguete láser automático con sensor de movimiento',
 15999.00, 12999.00, 2, 3, 'JIL-GAT-001', FALSE, '2024-01-20'),

('Cama Ortopédica Memory Foam',
 'Cama con espuma viscoelástica que se adapta al cuerpo de tu mascota, proporcionando el máximo confort y apoyo para articulaciones. Funda lavable incluida.',
 'Cama ortopédica con memory foam y funda lavable',
 45999.00, NULL, 3, 2, 'COM-ORT-001', FALSE, '2024-01-10'),

('Collar GPS Inteligente Pro',
 'Collar con GPS de alta precisión, monitor de actividad, geovallas personalizables y batería de larga duración. Resistente al agua IPX7.',
 'Collar GPS con monitor de actividad y geovallas',
 35999.00, 29999.00, 4, 4, 'CGP-PRO-001', TRUE, '2024-02-15'),

('Rascador Torre Gigante 180cm',
 'Torre rascador de 180cm con múltiples niveles, casitas, hamacas y juguetes colgantes. Base extra estable de 60x60cm.',
 'Torre rascador 180cm con múltiples niveles',
 89999.00, NULL, 5, 2, 'RTG-180-001', FALSE, '2024-01-05'),

('Juguete Dispensador de Premios',
 'Pelota interactiva que dispensa snacks mientras tu mascota juega. Dificultad ajustable y fabricada en caucho natural seguro.',
 'Pelota dispensadora de premios con dificultad ajustable',
 12999.00, NULL, 2, 3, 'JDP-PEL-001', FALSE, '2024-02-10'),

('Cama Térmica Autorregulable',
 'Cama que mantiene la temperatura corporal de tu mascota sin necesidad de electricidad. Gel térmico interno y funda lavable.',
 'Cama térmica sin electricidad con gel interno',
 32999.00, 27999.00, 3, 2, 'CTA-GEL-001', FALSE, '2024-01-25'),

('Collar LED Recargable',
 'Collar LED recargable por USB con múltiples modos de iluminación. Perfecto para paseos nocturnos y mayor visibilidad.',
 'Collar LED recargable USB con múltiples modos',
 8999.00, NULL, 4, 4, 'CLE-USB-001', FALSE, '2024-02-05'),

('Fuente de Agua Automática',
 'Fuente de agua con filtro de carbón activado, bomba silenciosa y capacidad de 2.5L. Estimula el consumo de agua en mascotas.',
 'Fuente automática con filtro y bomba silenciosa',
 25999.00, 22999.00, 6, 1, 'FAA-FIL-001', TRUE, '2024-01-30');

-- Insertar imágenes de productos
INSERT INTO producto_imagenes (producto_id, url, alt_text, es_principal, orden) VALUES
(1, '/images/comedero-wifi-premium-1.jpg', 'Comedero Wi-Fi Premium vista frontal', TRUE, 1),
(1, '/images/comedero-wifi-premium-2.jpg', 'Comedero Wi-Fi Premium vista lateral', FALSE, 2),
(2, '/images/comedero-wifi-basico-1.jpg', 'Comedero Wi-Fi Básico vista frontal', TRUE, 1),
(3, '/images/juguete-laser-1.jpg', 'Juguete láser para gatos', TRUE, 1),
(4, '/images/cama-ortopedica-1.jpg', 'Cama ortopédica memory foam', TRUE, 1),
(5, '/images/collar-gps-1.jpg', 'Collar GPS inteligente', TRUE, 1),
(6, '/images/rascador-torre-1.jpg', 'Torre rascador 180cm', TRUE, 1),
(7, '/images/dispensador-premios-1.jpg', 'Pelota dispensadora de premios', TRUE, 1),
(8, '/images/cama-termica-1.jpg', 'Cama térmica autorregulable', TRUE, 1),
(9, '/images/collar-led-1.jpg', 'Collar LED recargable', TRUE, 1),
(10, '/images/fuente-agua-1.jpg', 'Fuente de agua automática', TRUE, 1);

-- Insertar inventario
INSERT INTO inventario (producto_id, stock_actual, stock_minimo, stock_maximo) VALUES
(1, 15, 5, 50),
(2, 25, 10, 100),
(3, 50, 20, 200),
(4, 20, 5, 50),
(5, 30, 10, 100),
(6, 10, 3, 30),
(7, 40, 15, 150),
(8, 25, 8, 80),
(9, 60, 25, 250),
(10, 35, 12, 120);

-- Insertar especificaciones de productos
INSERT INTO producto_especificaciones (producto_id, nombre, valor, unidad, orden) VALUES
-- Comedero Wi-Fi Premium
(1, 'Capacidad', '2.5', 'L', 1),
(1, 'Conectividad', 'Wi-Fi 2.4GHz', '', 2),
(1, 'Alimentación', 'AC + Batería respaldo', '', 3),
(1, 'Material', 'Acero inoxidable', '', 4),
(1, 'Dimensiones', '35x25x15', 'cm', 5),

-- Comedero Wi-Fi Básico
(2, 'Capacidad', '1.8', 'L', 1),
(2, 'Conectividad', 'Wi-Fi 2.4GHz', '', 2),
(2, 'Alimentación', 'AC', '', 3),
(2, 'Material', 'Plástico ABS', '', 4),

-- Juguete Láser
(3, 'Batería', 'AAA x3', '', 1),
(3, 'Alcance láser', '5', 'm', 2),
(3, 'Temporizador', '15 min auto-off', '', 3),

-- Cama Ortopédica
(4, 'Tamaño', 'Grande (80x60)', 'cm', 1),
(4, 'Material', 'Memory Foam', '', 2),
(4, 'Grosor', '8', 'cm', 3),
(4, 'Peso máximo', '40', 'kg', 4),

-- Collar GPS
(5, 'Batería', '7 días', '', 1),
(5, 'Resistencia', 'IPX7', '', 2),
(5, 'Conectividad', '4G + GPS', '', 3),
(5, 'Peso', '45', 'g', 4);

-- Usuario de ejemplo
INSERT INTO usuarios (nombre, apellido, email, password, telefono, activo, email_verificado) VALUES
('Juan', 'Pérez', 'juan@example.com', '$2b$10$example_hash', '+54911234567', TRUE, TRUE);

-- Dirección de ejemplo
INSERT INTO direcciones (usuario_id, tipo, calle, numero, ciudad, provincia, codigo_postal, es_principal) VALUES
(1, 'casa', 'Av. Corrientes', '1234', 'Buenos Aires', 'CABA', '1043', TRUE);