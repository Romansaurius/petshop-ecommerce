# 🚀 Guía de Despliegue en Render

## Configuración Completa

### 1. Preparación del Repositorio
- ✅ Frontend y Backend configurados en un solo servicio
- ✅ Base de datos Railway ya configurada
- ✅ Variables de entorno listas

### 2. Despliegue en Render

#### Crear Web Service:
1. Conectar repositorio de GitHub
2. Configurar:
   - **Build Command**: `cd server && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node

#### Variables de Entorno en Render:
```
NODE_ENV=production
DB_HOST=shuttle.proxy.rlwy.net
DB_PORT=21840
DB_USER=root
DB_PASSWORD=anJkMDnhTJoXaMDjgYFpfmkMBUskRZFu
DB_NAME=ecommerce_mascotas
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_2024
```

### 3. Estructura del Despliegue
```
Render Web Service
├── Build: Compila React + instala dependencias
├── Start: Ejecuta servidor Node.js
├── Serve: Frontend estático + API REST
└── Database: Railway MySQL (externa)
```

### 4. URLs Finales
- **Aplicación completa**: `https://tu-app.onrender.com`
- **API**: `https://tu-app.onrender.com/api/*`
- **Frontend**: `https://tu-app.onrender.com/*`

### 5. Verificación Post-Despliegue
- [ ] Frontend carga correctamente
- [ ] API responde en `/api/products`
- [ ] Conexión a base de datos Railway
- [ ] Autenticación JWT funciona
- [ ] Carrito de compras persiste

## Comandos Locales de Prueba
```bash
# Simular build de producción
cd server && npm run build

# Probar servidor con archivos estáticos
cd server && npm start
```