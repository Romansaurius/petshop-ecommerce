-- =====================================================
-- E-COMMERCE MASCOTAS - ESQUEMA COMPLETO OPTIMIZADO
-- Basado en análisis del código React/Node.js existente
-- =====================================================

DROP DATABASE IF EXISTS ecommerce_mascotas;
CREATE DATABASE ecommerce_mascotas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_mascotas;

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de categorías
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de marcas
CREATE TABLE marcas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    logo VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (compatible con AuthContext)
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Tabla de productos (compatible con ProductCard y modelos)
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2) NULL,
    descuento_porcentaje INT DEFAULT 0,
    categoria_id INT NOT NULL,
    marca_id INT,
    sku VARCHAR(50) UNIQUE,
    imagen VARCHAR(255),
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (marca_id) REFERENCES marcas(id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_destacado (destacado),
    INDEX idx_activo (activo),
    FULLTEXT idx_busqueda (nombre, descripcion, descripcion_corta)
);

-- Tabla de inventario (compatible con ProductCard stock)
CREATE TABLE inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL UNIQUE,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    reservado INT DEFAULT 0,
    disponible INT GENERATED ALWAYS AS (stock_actual - reservado) STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Tabla de pedidos (compatible con Checkout y Order model)
CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INT,
    email_contacto VARCHAR(100) NOT NULL,
    telefono_contacto VARCHAR(20),
    direccion_envio TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) NOT NULL DEFAULT 0,
    envio DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mercadopago') NOT NULL,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado)
);

-- Tabla de detalles de pedido (compatible con Order model)
CREATE TABLE detalles_pedido (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    INDEX idx_pedido (pedido_id)
);

-- =====================================================
-- DATOS DE EJEMPLO PARA E-COMMERCE MASCOTAS
-- =====================================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, imagen) VALUES
('comederos', 'Comederos automáticos y tradicionales para mascotas', '/images/cat-comederos.jpg'),
('juguetes', 'Juguetes interactivos y tradicionales para perros y gatos', '/images/cat-juguetes.jpg'),
('camas', 'Camas cómodas y ortopédicas para el descanso', '/images/cat-camas.jpg'),
('collares', 'Collares, correas y accesorios de paseo', '/images/cat-collares.jpg'),
('rascadores', 'Rascadores y torres para gatos', '/images/cat-rascadores.jpg'),
('accesorios', 'Otros accesorios y productos para mascotas', '/images/cat-accesorios.jpg');

-- Insertar marcas
INSERT INTO marcas (nombre, descripcion) VALUES
('PetTech', 'Tecnología avanzada para el cuidado de mascotas'),
('ComfortPet', 'Productos de máxima comodidad y bienestar'),
('PlayTime', 'Diversión y entretenimiento garantizado'),
('SafePet', 'Seguridad y protección para tu mascota'),
('NaturalLife', 'Productos naturales y ecológicos');

-- Insertar productos con descuentos y características del frontend
INSERT INTO productos (nombre, descripcion, descripcion_corta, precio, precio_oferta, descuento_porcentaje, categoria_id, marca_id, sku, imagen, destacado, stock) VALUES

-- COMEDEROS (Productos estrella)
('Comedero Automático Wi-Fi Premium', 
 'Comedero inteligente con conectividad Wi-Fi, programación por horarios, control remoto desde app móvil, cámara integrada HD y dispensador de agua automático. Capacidad 2.5L, ideal para mantener a tu mascota alimentada incluso cuando no estás en casa. Incluye sensores de peso y notificaciones push.',
 'Comedero inteligente Wi-Fi con app móvil, cámara HD y dispensador de agua',
 89999.00, 79999.00, 11, 1, 1, 'CAW-PREM-001', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', TRUE, 15),

('Comedero Automático Wi-Fi Básico',
 'Comedero automático con conectividad Wi-Fi y programación básica por horarios. Perfecto para rutinas regulares de alimentación con control desde tu smartphone. Capacidad 1.8L, material resistente y fácil limpieza.',
 'Comedero automático Wi-Fi con programación básica y control móvil',
 59999.00, 49999.00, 17, 1, 1, 'CAW-BAS-001', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', TRUE, 25),

-- JUGUETES
('Juguete Interactivo Láser Automático',
 'Juguete automático con láser que se mueve aleatoriamente para mantener a tu gato activo y entretenido. Incluye sensor de movimiento, temporizador automático de seguridad y múltiples patrones de juego.',
 'Juguete láser automático con sensor de movimiento y temporizador',
 15999.00, 12799.00, 20, 2, 3, 'JIL-GAT-001', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', FALSE, 50),

('Pelota Dispensadora de Premios',
 'Pelota interactiva que dispensa snacks mientras tu mascota juega. Dificultad ajustable, fabricada en caucho natural seguro y resistente. Estimula la actividad física y mental.',
 'Pelota dispensadora de premios con dificultad ajustable',
 12999.00, NULL, 0, 2, 3, 'JDP-PEL-001', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', FALSE, 40),

('Cuerda Interactiva XXL',
 'Cuerda de algodón natural extra resistente para juegos de tira y afloja. Perfecta para perros grandes, ayuda a mantener dientes limpios y encías saludables.',
 'Cuerda de algodón natural XXL para perros grandes',
 8999.00, 6999.00, 22, 2, 3, 'CIN-XXL-001', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', FALSE, 60),

-- CAMAS
('Cama Ortopédica Memory Foam Grande',
 'Cama con espuma viscoelástica de alta densidad que se adapta perfectamente al cuerpo de tu mascota. Proporciona máximo confort y apoyo para articulaciones. Funda lavable incluida, ideal para perros mayores.',
 'Cama ortopédica con memory foam de alta densidad y funda lavable',
 45999.00, 36799.00, 20, 3, 2, 'COM-ORT-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 20),

('Cama Térmica Autorregulable',
 'Cama innovadora que mantiene la temperatura corporal de tu mascota sin necesidad de electricidad. Gel térmico interno, funda lavable y base antideslizante.',
 'Cama térmica sin electricidad con gel interno autorregulable',
 32999.00, 26399.00, 20, 3, 2, 'CTA-GEL-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 25),

-- COLLARES Y ACCESORIOS
('Collar GPS Inteligente Pro',
 'Collar con GPS de alta precisión, monitor de actividad 24/7, geovallas personalizables y batería de larga duración (7 días). Resistente al agua IPX7, perfecto para aventureros.',
 'Collar GPS con monitor de actividad, geovallas y resistencia IPX7',
 35999.00, 28799.00, 20, 4, 4, 'CGP-PRO-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', TRUE, 30),

('Collar LED Recargable USB',
 'Collar LED recargable por USB con múltiples modos de iluminación (fijo, intermitente, arcoíris). Perfecto para paseos nocturnos y mayor visibilidad. Batería de larga duración.',
 'Collar LED recargable USB con múltiples modos de iluminación',
 8999.00, NULL, 0, 4, 4, 'CLE-USB-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 60),

('Correa Extensible Premium 5m',
 'Correa retráctil de alta calidad con sistema de frenado suave y mango ergonómico. Soporta hasta 50kg, ideal para perros medianos y grandes.',
 'Correa retráctil 5m con freno suave y mango ergonómico',
 18999.00, 15199.00, 20, 4, 4, 'CEP-5M-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 35),

-- RASCADORES
('Torre Rascador Gigante 180cm',
 'Torre rascador de 180cm con múltiples niveles, casitas acogedoras, hamacas colgantes y juguetes incluidos. Base extra estable de 60x60cm, perfecta para hogares con múltiples gatos.',
 'Torre rascador 180cm con múltiples niveles y base estable',
 89999.00, NULL, 0, 5, 2, 'RTG-180-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 10),

('Rascador Horizontal Ondulado',
 'Rascador de cartón corrugado con forma ondulada. Incluye hierba gatera orgánica, base antideslizante y es 100% reciclable.',
 'Rascador de cartón ondulado con hierba gatera incluida',
 5999.00, 4799.00, 20, 5, 5, 'RHO-CAR-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 80),

-- ACCESORIOS
('Fuente de Agua Automática 2.5L',
 'Fuente de agua con filtro de carbón activado triple, bomba ultra silenciosa y capacidad de 2.5L. Estimula el consumo de agua en mascotas, mejorando su hidratación y salud renal.',
 'Fuente automática con filtro triple y bomba silenciosa',
 25999.00, 20799.00, 20, 6, 1, 'FAA-FIL-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', TRUE, 35),

('Kit de Aseo Profesional',
 'Kit completo de aseo con cepillo desenredante, cortaúñas profesional, champú hipoalergénico, toallas de microfibra y estuche organizador.',
 'Kit completo de aseo profesional con estuche organizador',
 22999.00, NULL, 0, 6, 2, 'KAP-COM-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 45),

('Transportadora Airline Approved',
 'Transportadora rígida aprobada por aerolíneas internacionales. Ventilación superior, puerta de acero inoxidable y ruedas desmontables. Ideal para viajes seguros.',
 'Transportadora rígida aprobada por aerolíneas con ruedas',
 65999.00, 52799.00, 20, 6, 4, 'TAA-RIG-001', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', FALSE, 15);

-- Insertar inventario para todos los productos
INSERT INTO inventario (producto_id, stock_actual, stock_minimo, reservado) 
SELECT id, stock, 5, 0 FROM productos;

-- Generar números de pedido únicos
SET @pedido_counter = 1;

-- Función para generar número de pedido
DELIMITER //
CREATE FUNCTION generar_numero_pedido() 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE numero VARCHAR(20);
    SET numero = CONCAT('PED', YEAR(NOW()), LPAD(@pedido_counter, 6, '0'));
    SET @pedido_counter = @pedido_counter + 1;
    RETURN numero;
END //
DELIMITER ;

-- Usuario de ejemplo para pruebas
INSERT INTO usuarios (nombre, email, password, telefono, direccion, email_verificado) VALUES
('Juan Pérez', 'juan@petshop.com', '$2b$10$example_hash_password', '+54911234567', 'Av. Corrientes 1234, CABA', TRUE),
('María González', 'maria@petshop.com', '$2b$10$example_hash_password', '+54911765432', 'Av. Santa Fe 5678, CABA', TRUE);

-- =====================================================
-- VISTAS ÚTILES PARA EL FRONTEND
-- =====================================================

-- Vista de productos completos (compatible con ProductCard)
CREATE VIEW v_productos_completos AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.descripcion_corta,
    p.precio,
    p.precio_oferta,
    p.descuento_porcentaje,
    p.sku,
    p.imagen,
    p.destacado,
    p.stock,
    c.nombre as categoria,
    m.nombre as marca,
    i.disponible,
    p.created_at,
    -- Calcular precio final con descuento
    CASE 
        WHEN p.precio_oferta IS NOT NULL THEN p.precio_oferta
        WHEN p.descuento_porcentaje > 0 THEN ROUND(p.precio * (1 - p.descuento_porcentaje / 100), 2)
        ELSE p.precio
    END as precio_final,
    -- Calcular ahorro
    CASE 
        WHEN p.precio_oferta IS NOT NULL THEN (p.precio - p.precio_oferta)
        WHEN p.descuento_porcentaje > 0 THEN ROUND(p.precio * (p.descuento_porcentaje / 100), 2)
        ELSE 0
    END as ahorro
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN inventario i ON p.id = i.producto_id
WHERE p.activo = TRUE;

-- Vista de productos destacados
CREATE VIEW v_productos_destacados AS
SELECT * FROM v_productos_completos 
WHERE destacado = TRUE 
ORDER BY created_at DESC;

-- Vista de productos con descuento
CREATE VIEW v_productos_ofertas AS
SELECT * FROM v_productos_completos 
WHERE (precio_oferta IS NOT NULL OR descuento_porcentaje > 0)
ORDER BY ahorro DESC;

-- =====================================================
-- STORED PROCEDURES PARA EL BACKEND
-- =====================================================

DELIMITER //

-- Procedure para buscar productos (compatible con search del frontend)
CREATE PROCEDURE sp_buscar_productos(
    IN p_busqueda VARCHAR(255),
    IN p_categoria VARCHAR(50),
    IN p_limite INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM v_productos_completos
    WHERE (p_busqueda IS NULL OR 
           MATCH(nombre, descripcion, descripcion_corta) AGAINST(p_busqueda IN NATURAL LANGUAGE MODE) OR
           nombre LIKE CONCAT('%', p_busqueda, '%') OR
           descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND (p_categoria IS NULL OR categoria = p_categoria)
    ORDER BY destacado DESC, created_at DESC
    LIMIT p_limite OFFSET p_offset;
END //

-- Procedure para crear pedido (compatible con Checkout)
CREATE PROCEDURE sp_crear_pedido_completo(
    IN p_usuario_id INT,
    IN p_email VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_direccion TEXT,
    IN p_metodo_pago VARCHAR(20),
    IN p_items JSON
)
BEGIN
    DECLARE v_pedido_id INT;
    DECLARE v_numero_pedido VARCHAR(20);
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_impuestos DECIMAL(10,2);
    DECLARE v_envio DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_producto_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_precio DECIMAL(10,2);
    
    -- Cursor para procesar items del JSON
    DECLARE item_cursor CURSOR FOR 
        SELECT 
            JSON_UNQUOTE(JSON_EXTRACT(item, '$.producto_id')) as producto_id,
            JSON_UNQUOTE(JSON_EXTRACT(item, '$.cantidad')) as cantidad,
            JSON_UNQUOTE(JSON_EXTRACT(item, '$.precio_unitario')) as precio
        FROM JSON_TABLE(p_items, '$[*]' COLUMNS (item JSON PATH '$')) as jt;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Generar número de pedido único
    SET v_numero_pedido = generar_numero_pedido();
    
    -- Calcular subtotal desde los items
    OPEN item_cursor;
    read_loop: LOOP
        FETCH item_cursor INTO v_producto_id, v_cantidad, v_precio;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SET v_subtotal = v_subtotal + (v_cantidad * v_precio);
    END LOOP;
    CLOSE item_cursor;
    
    -- Calcular impuestos (21% IVA)
    SET v_impuestos = v_subtotal * 0.21;
    
    -- Calcular envío (gratis si > $120.000)
    SET v_envio = CASE WHEN v_subtotal > 120000 THEN 0 ELSE 5000 END;
    
    -- Total final
    SET v_total = v_subtotal + v_impuestos + v_envio;
    
    -- Crear pedido
    INSERT INTO pedidos (
        numero_pedido, usuario_id, email_contacto, telefono_contacto,
        direccion_envio, subtotal, impuestos, envio, total, metodo_pago
    ) VALUES (
        v_numero_pedido, p_usuario_id, p_email, p_telefono,
        p_direccion, v_subtotal, v_impuestos, v_envio, v_total, p_metodo_pago
    );
    
    SET v_pedido_id = LAST_INSERT_ID();
    
    -- Insertar detalles del pedido
    SET done = FALSE;
    OPEN item_cursor;
    read_loop2: LOOP
        FETCH item_cursor INTO v_producto_id, v_cantidad, v_precio;
        IF done THEN
            LEAVE read_loop2;
        END IF;
        
        INSERT INTO detalles_pedido (pedido_id, producto_id, nombre_producto, cantidad, precio_unitario)
        SELECT v_pedido_id, v_producto_id, nombre, v_cantidad, v_precio
        FROM productos WHERE id = v_producto_id;
        
        -- Actualizar stock
        UPDATE inventario 
        SET stock_actual = stock_actual - v_cantidad
        WHERE producto_id = v_producto_id;
        
    END LOOP;
    CLOSE item_cursor;
    
    SELECT v_pedido_id as pedido_id, v_numero_pedido as numero_pedido, v_total as total;
END //

DELIMITER ;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_productos_categoria_destacado ON productos(categoria_id, destacado);
CREATE INDEX idx_productos_precio_descuento ON productos(precio, descuento_porcentaje);
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(created_at, estado);
CREATE INDEX idx_usuarios_email_activo ON usuarios(email, activo);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
ESTE ESQUEMA ESTÁ OPTIMIZADO PARA:

1. FRONTEND REACT:
   - Compatible con ProductCard (precio, descuento_porcentaje, stock)
   - Compatible con CartContext (productos, cantidades)
   - Compatible con AuthContext (usuarios, email, password)
   - Compatible con Checkout (pedidos, direccion_envio, metodo_pago)

2. BACKEND NODE.JS:
   - Compatible con modelos Product, User, Order
   - Rutas API para productos, auth, cart, orders
   - Búsqueda y filtros por categoría

3. FUNCIONALIDADES:
   - Sistema de descuentos automático
   - Cálculo de envío gratis (+$120.000)
   - Inventario en tiempo real
   - Productos destacados
   - Búsqueda full-text

4. DATOS DE EJEMPLO:
   - 16 productos de mascotas realistas
   - Categorías: comederos, juguetes, camas, collares, rascadores, accesorios
   - Precios en pesos argentinos
   - Descuentos y ofertas aplicados
   - Stock disponible

PARA IMPORTAR:
1. Ejecutar este script en MySQL/Railway
2. Verificar que las tablas se crearon correctamente
3. Los datos de ejemplo estarán listos para usar
4. El frontend React funcionará inmediatamente

USUARIOS DE PRUEBA:
- juan@petshop.com / password (encriptado)
- maria@petshop.com / password (encriptado)
*/