-- =====================================================
-- E-COMMERCE MASCOTAS - ESQUEMA COMPLETO NORMALIZADO
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

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero ENUM('M', 'F', 'Otro'),
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_activo (activo)
);

-- Tabla de direcciones
CREATE TABLE direcciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('casa', 'trabajo', 'otro') DEFAULT 'casa',
    calle VARCHAR(255) NOT NULL,
    numero VARCHAR(10),
    piso VARCHAR(10),
    departamento VARCHAR(10),
    ciudad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pais VARCHAR(50) DEFAULT 'Argentina',
    es_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
);

-- Tabla de productos
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2),
    categoria_id INT NOT NULL,
    marca_id INT,
    sku VARCHAR(50) UNIQUE,
    codigo_barras VARCHAR(50),
    peso DECIMAL(8,3),
    dimensiones JSON,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_lanzamiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (marca_id) REFERENCES marcas(id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_destacado (destacado),
    INDEX idx_activo (activo),
    INDEX idx_precio (precio),
    FULLTEXT idx_busqueda (nombre, descripcion, descripcion_corta)
);

-- Tabla de imágenes de productos
CREATE TABLE producto_imagenes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    es_principal BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_producto (producto_id)
);

-- Tabla de inventario
CREATE TABLE inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL UNIQUE,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    stock_maximo INT DEFAULT 1000,
    reservado INT DEFAULT 0,
    disponible INT GENERATED ALWAYS AS (stock_actual - reservado) STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_disponible (disponible)
);

-- Tabla de especificaciones de productos
CREATE TABLE producto_especificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    unidad VARCHAR(20),
    orden INT DEFAULT 0,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_producto (producto_id)
);

-- Tabla de carritos
CREATE TABLE carritos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_session (session_id)
);

-- Tabla de items del carrito
CREATE TABLE carrito_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    carrito_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    UNIQUE KEY unique_carrito_producto (carrito_id, producto_id),
    INDEX idx_carrito (carrito_id)
);

-- Tabla de pedidos
CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INT,
    email_contacto VARCHAR(100) NOT NULL,
    telefono_contacto VARCHAR(20),
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuentos DECIMAL(10,2) NOT NULL DEFAULT 0,
    envio DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mercadopago') NOT NULL,
    direccion_envio JSON NOT NULL,
    notas TEXT,
    fecha_estimada_entrega DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_numero (numero_pedido)
);

-- Tabla de detalles de pedido
CREATE TABLE pedido_detalles (
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

-- Tabla de historial de estados de pedido
CREATE TABLE pedido_estados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    estado_anterior ENUM('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'),
    estado_nuevo ENUM('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado') NOT NULL,
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_pedido (pedido_id)
);

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure para obtener productos con filtros
CREATE PROCEDURE sp_obtener_productos(
    IN p_categoria_id INT,
    IN p_busqueda VARCHAR(255),
    IN p_precio_min DECIMAL(10,2),
    IN p_precio_max DECIMAL(10,2),
    IN p_destacados BOOLEAN,
    IN p_limite INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.descripcion_corta,
        p.precio,
        p.precio_oferta,
        p.destacado,
        c.nombre as categoria,
        m.nombre as marca,
        pi.url as imagen_principal,
        i.disponible as stock
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN marcas m ON p.marca_id = m.id
    LEFT JOIN producto_imagenes pi ON p.id = pi.producto_id AND pi.es_principal = TRUE
    LEFT JOIN inventario i ON p.id = i.producto_id
    WHERE p.activo = TRUE
        AND (p_categoria_id IS NULL OR p.categoria_id = p_categoria_id)
        AND (p_busqueda IS NULL OR MATCH(p.nombre, p.descripcion, p.descripcion_corta) AGAINST(p_busqueda IN NATURAL LANGUAGE MODE))
        AND (p_precio_min IS NULL OR p.precio >= p_precio_min)
        AND (p_precio_max IS NULL OR p.precio <= p_precio_max)
        AND (p_destacados IS NULL OR p.destacado = p_destacados)
    ORDER BY p.destacado DESC, p.created_at DESC
    LIMIT p_limite OFFSET p_offset;
END //

-- Procedure para agregar producto al carrito
CREATE PROCEDURE sp_agregar_al_carrito(
    IN p_usuario_id INT,
    IN p_session_id VARCHAR(255),
    IN p_producto_id INT,
    IN p_cantidad INT
)
BEGIN
    DECLARE v_carrito_id INT;
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_stock_disponible INT;
    
    -- Verificar stock disponible
    SELECT disponible INTO v_stock_disponible 
    FROM inventario 
    WHERE producto_id = p_producto_id;
    
    IF v_stock_disponible < p_cantidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
    
    -- Obtener precio actual del producto
    SELECT COALESCE(precio_oferta, precio) INTO v_precio 
    FROM productos 
    WHERE id = p_producto_id AND activo = TRUE;
    
    -- Buscar o crear carrito
    SELECT id INTO v_carrito_id 
    FROM carritos 
    WHERE (usuario_id = p_usuario_id OR session_id = p_session_id)
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    IF v_carrito_id IS NULL THEN
        INSERT INTO carritos (usuario_id, session_id) 
        VALUES (p_usuario_id, p_session_id);
        SET v_carrito_id = LAST_INSERT_ID();
    END IF;
    
    -- Agregar o actualizar item en carrito
    INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unitario)
    VALUES (v_carrito_id, p_producto_id, p_cantidad, v_precio)
    ON DUPLICATE KEY UPDATE 
        cantidad = LEAST(cantidad + p_cantidad, 10),
        precio_unitario = v_precio;
        
    SELECT 'Producto agregado al carrito' as mensaje;
END //

-- Procedure para crear pedido
CREATE PROCEDURE sp_crear_pedido(
    IN p_usuario_id INT,
    IN p_carrito_id INT,
    IN p_email VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_direccion JSON,
    IN p_metodo_pago VARCHAR(20)
)
BEGIN
    DECLARE v_pedido_id INT;
    DECLARE v_numero_pedido VARCHAR(20);
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_impuestos DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    
    -- Generar número de pedido único
    SET v_numero_pedido = CONCAT('PED', YEAR(NOW()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
    
    -- Calcular subtotal
    SELECT SUM(cantidad * precio_unitario) INTO v_subtotal
    FROM carrito_items
    WHERE carrito_id = p_carrito_id;
    
    -- Calcular impuestos (21% IVA)
    SET v_impuestos = v_subtotal * 0.21;
    SET v_total = v_subtotal + v_impuestos;
    
    -- Crear pedido
    INSERT INTO pedidos (
        numero_pedido, usuario_id, email_contacto, telefono_contacto,
        subtotal, impuestos, total, metodo_pago, direccion_envio
    ) VALUES (
        v_numero_pedido, p_usuario_id, p_email, p_telefono,
        v_subtotal, v_impuestos, v_total, p_metodo_pago, p_direccion
    );
    
    SET v_pedido_id = LAST_INSERT_ID();
    
    -- Copiar items del carrito al pedido
    INSERT INTO pedido_detalles (pedido_id, producto_id, nombre_producto, cantidad, precio_unitario)
    SELECT 
        v_pedido_id,
        ci.producto_id,
        p.nombre,
        ci.cantidad,
        ci.precio_unitario
    FROM carrito_items ci
    JOIN productos p ON ci.producto_id = p.id
    WHERE ci.carrito_id = p_carrito_id;
    
    -- Actualizar inventario (reservar stock)
    UPDATE inventario i
    JOIN carrito_items ci ON i.producto_id = ci.producto_id
    SET i.reservado = i.reservado + ci.cantidad
    WHERE ci.carrito_id = p_carrito_id;
    
    -- Limpiar carrito
    DELETE FROM carrito_items WHERE carrito_id = p_carrito_id;
    
    -- Registrar estado inicial
    INSERT INTO pedido_estados (pedido_id, estado_nuevo, comentario)
    VALUES (v_pedido_id, 'pendiente', 'Pedido creado');
    
    SELECT v_pedido_id as pedido_id, v_numero_pedido as numero_pedido;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar stock después de confirmar pedido
DELIMITER //
CREATE TRIGGER tr_actualizar_stock_pedido
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF OLD.estado = 'pendiente' AND NEW.estado = 'confirmado' THEN
        UPDATE inventario i
        JOIN pedido_detalles pd ON i.producto_id = pd.producto_id
        SET 
            i.stock_actual = i.stock_actual - pd.cantidad,
            i.reservado = i.reservado - pd.cantidad
        WHERE pd.pedido_id = NEW.id;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- VISTAS
-- =====================================================

-- Vista de productos con información completa
CREATE VIEW v_productos_completos AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.descripcion_corta,
    p.precio,
    p.precio_oferta,
    p.sku,
    p.destacado,
    c.nombre as categoria,
    m.nombre as marca,
    i.stock_actual,
    i.disponible,
    pi.url as imagen_principal,
    p.created_at
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN inventario i ON p.id = i.producto_id
LEFT JOIN producto_imagenes pi ON p.id = pi.producto_id AND pi.es_principal = TRUE
WHERE p.activo = TRUE;

-- =====================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_productos_categoria_destacado ON productos(categoria_id, destacado);
CREATE INDEX idx_productos_precio_categoria ON productos(precio, categoria_id);
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(created_at, estado);
CREATE INDEX idx_carrito_items_producto ON carrito_items(producto_id);