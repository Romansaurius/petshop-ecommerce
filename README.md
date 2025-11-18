# 🐾 E-commerce de Productos para Mascotas

E-commerce completo desarrollado con stack MERN/MERV (React.js, Node.js/Express.js, MySQL) especializado en productos para mascotas, con comederos automáticos Wi-Fi como producto estrella.

## 🚀 Características Principales

### Frontend (React.js)
- ✅ Diseño responsive mobile-first
- ✅ Carrito de compras con persistencia
- ✅ Límite de 10 unidades por producto
- ✅ Productos destacados (Comederos Wi-Fi)
- ✅ Búsqueda y filtros por categoría
- ✅ Autenticación completa (Login/Register)
- ✅ Checkout con simulación de pago
- ✅ Cálculo automático de impuestos (IVA 21%)

### Backend (Node.js/Express.js)
- ✅ API REST completa
- ✅ Autenticación JWT
- ✅ Base de datos MySQL
- ✅ Gestión de productos, usuarios y pedidos
- ✅ Middleware de seguridad

### Base de Datos (MySQL)
- ✅ Esquema completo con relaciones
- ✅ Datos de ejemplo incluidos
- ✅ Productos de mascotas precargados

## 📁 Estructura del Proyecto

```
ecommerce-mascotas/
├── client/                  # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── Header/      # Navegación y búsqueda
│   │   │   ├── Product/     # Tarjetas de producto
│   │   │   └── Cart/        # Carrito lateral
│   │   ├── pages/           # Páginas principales
│   │   │   ├── Home/        # Página principal
│   │   │   ├── Login/       # Inicio de sesión
│   │   │   ├── Register/    # Registro
│   │   │   └── Checkout/    # Proceso de compra
│   │   ├── context/         # Contextos React
│   │   │   ├── CartContext.js
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                  # Backend Node.js
│   ├── controllers/
│   ├── models/              # Modelos de datos
│   │   ├── Product.js
│   │   ├── User.js
│   │   └── Order.js
│   ├── routes/              # Rutas API
│   │   ├── productRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── config/
│   │   └── database.js
│   ├── server.js
│   └── package.json
├── database/                # Scripts de DB
│   ├── schema.sql           # Estructura de tablas
│   └── seeds/
│       └── productos.sql    # Datos de ejemplo
└── README.md
```

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd ecommerce-mascotas
```

### 2. Configurar la base de datos
```bash
# Crear la base de datos MySQL
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds/productos.sql
```

### 3. Configurar el servidor
```bash
cd server
npm install
# Configurar variables de entorno en .env
npm run dev
```

### 4. Configurar el cliente
```bash
cd client
npm install
npm start
```

## 🎯 Productos Destacados

### Comederos Automáticos Wi-Fi
- **Premium**: $89.999 - Capacidad 2.5L, Wi-Fi, App móvil
- **Básico**: $59.999 - Capacidad 1.8L, Wi-Fi básico

### Otros Productos
- Juguetes interactivos
- Camas ortopédicas
- Collares GPS
- Rascadores
- Accesorios varios

## 🔧 Funcionalidades Técnicas

### Carrito de Compras
- Persistencia en localStorage
- Límite de 10 unidades por producto
- Cálculo automático de totales
- Gestión de cantidades

### Sistema de Pago (Simulado)
- Flujo completo de checkout
- Validación de datos de envío
- Simulación de métodos de pago
- Confirmación de pedido

### Autenticación
- Registro de usuarios
- Login con JWT
- Protección de rutas
- Persistencia de sesión

## 🚀 Comandos de Desarrollo

```bash
# Servidor (Puerto 5000)
cd server
npm run dev

# Cliente (Puerto 3000)
cd client
npm start

# Base de datos
mysql -u root -p ecommerce_mascotas
```

## 📱 Diseño Responsive

- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints**: 480px, 768px, 1200px
- **Componentes adaptables**: Grid flexible, menús colapsables
- **UX optimizada**: Navegación táctil, botones grandes

## 🔒 Seguridad

- Autenticación JWT
- Validación de datos
- Protección CORS
- Sanitización de inputs
- Encriptación de contraseñas

## 📊 Base de Datos

### Tablas Principales
- `usuarios`: Datos de clientes
- `productos`: Catálogo de productos
- `pedidos`: Órdenes de compra
- `detalles_pedido`: Items de cada pedido

## 🎨 Paleta de Colores

- **Primario**: #ff6b35 (Naranja)
- **Secundario**: #f7931e (Naranja claro)
- **Texto**: #333333
- **Fondo**: #f8f9fa
- **Bordes**: #e0e0e0

## 📞 Soporte

Para consultas técnicas o funcionales, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para el cuidado de nuestras mascotas 🐾**