# CRM-Lite ERP System

Un sistema ERP completo y moderno desarrollado con las últimas tecnologías, que incluye gestión integral de clientes, productos, inventario, órdenes de venta, cotizaciones, reportes avanzados, notificaciones en tiempo real y automatización empresarial.

## 🚀 Características Principales

### Gestión Empresarial Completa
- **Dashboard Ejecutivo**: Métricas de negocio en tiempo real con visualizaciones por roles y gráficos interactivos
- **Gestión de Clientes**: CRUD completo con información detallada de contacto y historial
- **Control de Inventario**: Gestión avanzada de productos, categorías y alertas de stock bajo
- **Sistema de Órdenes**: Procesamiento completo de pedidos de venta con conversión desde cotizaciones
- **Gestión de Cotizaciones**: Creación, envío y seguimiento de cotizaciones con conversión automática a órdenes
- **Reportes Avanzados**: Análisis detallado con gráficos interactivos, KPIs y exportación de datos
- **Control de Acceso**: Sistema de roles (Admin, Manager, User) con permisos específicos

### Características Avanzadas
- **🔔 Notificaciones en Tiempo Real**: Sistema de notificaciones push con WebSocket
- **📧 Automatización por Email**: Notificaciones automáticas para eventos importantes
- **⏰ Tareas Programadas**: Alertas automáticas de stock bajo y cotizaciones expiradas
- **📊 Visualizaciones Interactivas**: Gráficos dinámicos con Recharts
- **🔄 Comunicación en Tiempo Real**: WebSocket para actualizaciones instantáneas
- **📱 Interfaz Moderna**: UI/UX profesional con Tailwind CSS y Heroicons

### Tecnologías Modernas
- **Frontend**: React 19.2.0 con Vite, Tailwind CSS, Heroicons, Socket.IO Client, Recharts
- **Backend**: Node.js con Express, JWT Authentication, bcryptjs, Socket.IO, Nodemailer, Node-cron
- **Base de Datos**: MySQL con Sequelize ORM y relaciones complejas
- **Arquitectura**: MVC con servicios especializados y middleware de autenticación

## 🎯 Características Avanzadas

### Notificaciones en Tiempo Real
- **WebSocket Integration**: Comunicación bidireccional en tiempo real
- **Notificaciones Push**: Alertas instantáneas para eventos importantes
- **Centro de Notificaciones**: Interfaz dedicada para gestionar notificaciones
- **Indicadores Visuales**: Badges y contadores en la navegación

### Gestión de Cotizaciones
- **Creación de Cotizaciones**: Interfaz intuitiva para crear cotizaciones detalladas
- **Seguimiento de Estados**: Control completo del ciclo de vida (borrador, enviada, aprobada, rechazada)
- **Conversión Automática**: Transformar cotizaciones aprobadas en órdenes de venta
- **Vigencia y Descuentos**: Gestión de fechas de expiración y descuentos por item

### Reportes y Analytics
- **Gráficos Interactivos**: Visualizaciones dinámicas con Recharts
- **KPIs en Tiempo Real**: Métricas clave del negocio actualizadas automáticamente
- **Filtros Avanzados**: Análisis por fechas, categorías y usuarios
- **Exportación de Datos**: Posibilidad de exportar reportes en múltiples formatos

### Automatización Empresarial
- **Alertas de Stock**: Notificaciones automáticas cuando productos están bajos en inventario
- **Recordatorios de Cotizaciones**: Alertas para cotizaciones próximas a expirar
- **Reportes Semanales**: Envío automático de reportes por email
- **Tareas Programadas**: Sistema de cron jobs para mantenimiento automático

### Experiencia de Usuario
- **Interfaz Moderna**: Diseño profesional con Tailwind CSS
- **Navegación Intuitiva**: Menú lateral con indicadores de notificaciones
- **Responsive Design**: Optimizado para desktop y dispositivos móviles
- **Feedback Visual**: Toasts y notificaciones para confirmar acciones

## 📋 Requisitos del Sistema

- Node.js (versión 16 o superior)
- MySQL Server (versión 8.0 o superior)
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd crm-lite
```

### 2. Configurar la Base de Datos
```sql
CREATE DATABASE crm_lite;
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend/`:
```env
# Servidor
PORT=5000

# Base de Datos
DB_NAME=crm_lite
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_HOST=localhost

# JWT
JWT_SECRET=tu_jwt_secret_seguro_muy_largo_y_complejo

# Email (opcional - para notificaciones automáticas)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

### 4. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 5. Ejecutar Migraciones de Base de Datos
```bash
cd backend
npm start
```
Esto creará automáticamente las tablas en la base de datos.

### 6. Poblar Datos de Ejemplo
Ejecutar el script de seeding desde la carpeta backend:
```bash
# Datos básicos (productos, categorías, clientes)
node -e "require('dotenv').config(); const { Category, Product } = require('./src/models'); async function seed() { /* script de seeding básico */ } seed();"

# Datos avanzados (notificaciones, cotizaciones)
node seed-advanced.js
```

## 🚀 Ejecución del Sistema

### Iniciar Backend
```bash
cd backend
npm start
```
Servidor disponible en: `http://localhost:5000`

### Iniciar Frontend
```bash
cd frontend
npm run dev
```
Aplicación disponible en: `http://localhost:5173`

## 👥 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@crm-lite.com | 123456 |
| Manager | manager@crm-lite.com | 123456 |
| Usuario | sales@crm-lite.com | 123456 |

## 📁 Estructura del Proyecto

```
crm-lite/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── category.controller.js
│   │   │   └── order.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── user.model.js
│   │   │   ├── customer.model.js
│   │   │   ├── category.model.js
│   │   │   ├── product.model.js
│   │   │   ├── order.model.js
│   │   │   └── orderItem.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── customer.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── category.routes.js
│   │   │   └── order.routes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   ├── .env
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Orders.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── .gitignore
└── README.md
```

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (solo admin)
- `GET /api/auth/profile` - Obtener perfil de usuario

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Crear cliente
- `PUT /api/customers/:id` - Actualizar cliente
- `DELETE /api/customers/:id` - Eliminar cliente

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Órdenes
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden
- `PUT /api/orders/:id` - Actualizar orden
- `DELETE /api/orders/:id` - Eliminar orden

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard

### Notificaciones
- `GET /api/notifications` - Listar notificaciones del usuario
- `PUT /api/notifications/:id/read` - Marcar notificación como leída
- `DELETE /api/notifications/:id` - Eliminar notificación

### Cotizaciones
- `GET /api/quotes` - Listar cotizaciones
- `POST /api/quotes` - Crear nueva cotización
- `GET /api/quotes/:id` - Obtener cotización específica
- `PUT /api/quotes/:id` - Actualizar cotización
- `PUT /api/quotes/:id/status` - Cambiar estado de cotización
- `POST /api/quotes/:id/convert` - Convertir cotización a orden
- `DELETE /api/quotes/:id` - Eliminar cotización

### Reportes
- `GET /api/reports/sales` - Reporte de ventas con filtros
- `GET /api/reports/products` - Reporte de productos más vendidos
- `GET /api/reports/customers` - Reporte de clientes más activos
- `GET /api/reports/revenue` - Reporte de ingresos por período

## 🔐 Sistema de Roles y Permisos

### Administrador (Admin)
- Acceso completo a todas las funcionalidades
- Gestión de usuarios
- Todas las operaciones CRUD
- Visualización de métricas globales

### Gerente (Manager)
- Gestión de clientes, productos y órdenes
- Visualización de reportes y estadísticas
- Acceso limitado a configuración del sistema

### Usuario (User)
- Gestión básica de clientes
- Visualización de productos y órdenes
- Dashboard con métricas limitadas

## 🎨 Interfaz de Usuario

### Diseño Moderno
- **Tailwind CSS**: Framework CSS utilitario para diseño responsivo
- **Heroicons**: Iconografía consistente y moderna
- **Responsive Design**: Optimizado para desktop y móvil

### Componentes Principales
- **Navbar**: Navegación dinámica según rol de usuario
- **Dashboard**: Cards con métricas y gráficos
- **Tablas**: Listados con búsqueda y filtros
- **Modales**: Formularios para creación/edición
- **Loading States**: Indicadores de carga y estados

## 🧪 Testing

### Ejecutar Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

## 🚀 Despliegue

### Producción
1. **Configurar variables de entorno de producción**:
   - Configurar credenciales de base de datos de producción
   - Configurar JWT_SECRET seguro
   - Configurar EMAIL_* variables para notificaciones
   - Configurar CORS_ORIGIN para el dominio de producción

2. **Construir y desplegar frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   Servir archivos estáticos desde `dist/` con nginx/apache

3. **Configurar backend para producción**:
   - Usar PM2 para gestión de procesos
   - Configurar logs rotativo
   - Configurar monitoreo de WebSocket connections
   - Configurar rate limiting para APIs

4. **Consideraciones de WebSocket**:
   - Configurar sticky sessions en load balancers
   - Configurar timeouts apropiados para conexiones largas
   - Monitorear conexiones activas y rendimiento

5. **Configuración de Email**:
   - Usar servicios como SendGrid, Mailgun o AWS SES
   - Configurar SPF/DKIM para mejor deliverability
   - Monitorear bounce rates y reputación del remitente

### Docker (Opcional)
```dockerfile
# Dockerfile para backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=5000
DB_HOST=tu_db_produccion
DB_NAME=crm_lite_prod
JWT_SECRET=tu_jwt_secret_muy_seguro
CORS_ORIGIN=https://tu-dominio.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=tu_sendgrid_api_key
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Contacto

Para preguntas o soporte, por favor contactar al desarrollador.

---

**Desarrollado con ❤️ para demostrar habilidades en desarrollo full-stack**