# 🚀 CRM Lite ERP - Sistema Integral de Gestión Empresarial

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 👨‍💻 Desarrollador

**Andy Rosado**  
Ingeniero de Sistemas | Desarrollador Web Full Stack  
República Dominicana

**Última Actualización:** Enero 2026

---

## 📋 Descripción

CRM Lite ERP es un sistema completo de gestión empresarial desarrollado con tecnologías modernas. Proporciona una solución integral para la administración de clientes, productos, órdenes, cotizaciones, facturación multi-moneda, pagos y reportes en tiempo real con notificaciones instantáneas vía WebSockets.

## ✨ Características Principales

### 🎯 Módulos Implementados

#### 🔐 Autenticación y Autorización
- JWT con access tokens y refresh tokens
- 3 roles diferenciados: admin, manager, user
- Middleware de permisos granulares por recurso
- Protección de rutas en frontend y backend

#### 👥 Gestión de Clientes
- CRUD completo con validación de cédula dominicana
- Límites de crédito personalizables
- Historial de órdenes y cotizaciones por cliente
- Soft delete para preservar datos históricos
- Búsqueda y filtros avanzados

#### 📦 Catálogo de Productos
- Gestión de inventario con control de stock
- Categorías jerárquicas
- Alertas de stock bajo automáticas
- Precios configurables por producto
- SKU único por producto

#### 📄 Cotizaciones Profesionales
- Formato de documento tipo factura A4/Carta
- Vista modal centrada para impresión optimizada
- Soporte de clientes registrados y nuevos
- **Multimoneda: DOP (RD$) y USD (US$)**
- Conversión automática a orden con un clic
- Validez configurable (días)
- Estados: draft, sent, accepted, rejected

#### 🛒 Sistema de Órdenes (Rediseñado)
- **UI Moderna con gradientes indigo-purple**
- Cards de estadísticas: Total, Pendientes, Entregadas, Ingresos
- 6 estados: pending, confirmed, processing, shipped, delivered, cancelled
- Búsqueda por número, cliente o email
- Filtros por estado con dropdown
- **Modal de edición** con actualización de estado, fecha entrega y notas
- **Eliminación con confirmación**
- **Notificaciones toast** (react-hot-toast)
- Tracking completo de órdenes

#### 💰 Facturación Avanzada
- Plantilla profesional A4/Carta para impresión
- **Multimoneda: DOP y USD**
- Estados: pending, paid, overdue, cancelled
- Cálculo automático de ITBIS (18%)
- Edición y eliminación de facturas pendientes
- Vista dedicada para reimpresión de facturas pagadas
- Generación automática de número de factura
- Fecha de vencimiento configurable

#### 💳 Sistema de Pagos
- Múltiples métodos: efectivo, tarjeta, transferencia, cheque
- Integración completa con Stripe
- **Modo simulación para países sin Stripe**
- Gestión de transacciones y reembolsos
- Historial de pagos por factura y orden
- Soporte de pagos parciales

#### 📊 Dashboard Interactivo
- **Navbar modernizado** con gradiente slate-900
- **Logo con icono sparkles** y texto degradado
- **Menú de usuario** con avatar y badge de rol por colores
- **Menú móvil hamburguesa** responsive
- **Notificaciones con badge animado**
- **4 KPIs principales**: Ventas, Clientes, Productos, Órdenes
- **Gráfico de ventas mensuales** (bar chart con Recharts)
- **Gráfico de estados de órdenes** (pie chart con datos reales)
- Actividad reciente en tiempo real
- Permisos diferenciados por rol

#### 🔔 Notificaciones en Tiempo Real
- Socket.IO para actualizaciones instantáneas
- **27 tipos de notificaciones** implementadas
- 4 categorías: success, info, warning, error
- Prioridades: low, medium, high, critical
- Centro de notificaciones con filtros
- Contador de no leídas con badge
- Marca individual y masiva como leída

#### 📈 Reportes Avanzados
- Reporte de ventas por período con filtros
- Reporte de inventario con alertas
- Reporte de clientes con métricas
- Datos para gráficos del dashboard
- Exportación a PDF (planificado)

### 🎨 Características de UI/UX

#### Diseño Moderno
- **Navbar con gradiente oscuro** (slate-900 → slate-800)
- **Badges de rol personalizados**: Admin (purple-pink), Manager (blue-cyan), User (green-emerald)
- **Estados activos con gradientes** indigo-purple
- **Modals profesionales** con headers degradados
- **Transiciones suaves** en todos los elementos
- **Hover effects** con escalado y cambios de color

#### Responsive Design
- Desktop: Navegación completa horizontal
- Tablet: Navegación compacta
- Mobile: Menú hamburguesa con slide-out
- Optimizado para todas las resoluciones
- Touch-friendly en dispositivos móviles

#### Documentos Profesionales
- Cotizaciones formato factura A4/Carta
- Facturas con diseño corporativo
- Vista previa antes de imprimir
- Botón flotante de impresión
- CSS específico para @page

### 🔒 Seguridad Implementada

#### Autenticación Robusta
- Hash de contraseñas con bcryptjs (10 salt rounds)
- JWT con expiración de 15 minutos
- Refresh tokens con 7 días de validez
- Logout con invalidación de tokens

#### Protecciones Activas
- **Helmet** para headers HTTP seguros
- **Rate Limiting**: 100 requests / 15 minutos
- **CORS** configurado para orígenes específicos
- **Sanitización XSS** en todos los inputs
- **Validación Joi** en todos los endpoints
- **SQL Injection Protection** vía Sequelize ORM
- **Logging de seguridad** para ataques

#### Control de Acceso
- RBAC (Role-Based Access Control)
- Middleware de permisos por recurso
- Rutas protegidas en frontend
- Validación de tokens en cada request

### ⚡ Performance y Escalabilidad

#### Backend Optimizado
- **Pool de conexiones MySQL**: max 10, timeout 60s
- **Caché en memoria** con TTL configurable
- **Paginación automática** en todos los listados
- **Transacciones DB** para operaciones críticas
- **Lazy loading** de relaciones
- **Wrapper catchAsync** para manejo de errores

#### Frontend Optimizado
- **Code splitting** automático con Vite
- **Lazy loading** de componentes
- **Context API** para estado global
- **Axios interceptors** para tokens
- **Socket.IO** con reconexión automática
- **React 19** con optimizaciones de concurrencia

### 📊 Sistema de Logging
- 4 niveles: ERROR, WARN, INFO, DEBUG
- Logs estructurados en archivos separados
- Rotación automática de logs
- Contexto enriquecido con userId, timestamp
- Logs de seguridad para ataques detectados

## 🏗️ Arquitectura del Sistema

```
crm-lite/
├── backend/                          # API REST Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # Configuración Sequelize + MySQL
│   │   ├── controllers/             # Lógica de negocio (15 controladores)
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── quote.controller.js
│   │   │   ├── invoice.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── paymentMethod.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── stripe.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js          # Verificación JWT
│   │   │   ├── permissions.middleware.js    # RBAC
│   │   │   ├── security.middleware.js       # Rate limit, logging
│   │   │   ├── validation.middleware.js     # Validación Joi
│   │   │   └── error.middleware.js          # Manejo global de errores
│   │   ├── models/                  # Modelos Sequelize (15 modelos)
│   │   │   ├── user.model.js
│   │   │   ├── customer.model.js
│   │   │   ├── product.model.js
│   │   │   ├── category.model.js
│   │   │   ├── order.model.js
│   │   │   ├── orderItem.model.js
│   │   │   ├── quote.model.js
│   │   │   ├── quoteItem.model.js
│   │   │   ├── invoice.model.js
│   │   │   ├── invoiceItem.model.js
│   │   │   ├── payment.model.js
│   │   │   ├── paymentMethod.model.js
│   │   │   ├── paymentTransaction.model.js
│   │   │   ├── notification.model.js
│   │   │   └── index.js                     # Relaciones
│   │   ├── routes/                  # Endpoints API (13 rutas)
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── customer.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── quote.routes.js
│   │   │   ├── invoice.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── stripe.routes.js
│   │   ├── utils/
│   │   │   ├── logger.js                    # Sistema de logging
│   │   │   ├── cache.js                     # Caché en memoria
│   │   │   └── pagination.js                # Paginación reutilizable
│   │   ├── validators/              # Esquemas Joi
│   │   ├── migrations/              # Scripts de migración DB
│   │   │   ├── add-currency-to-invoices.js
│   │   │   └── add-currency-to-quotes.js
│   │   ├── app.js                   # Configuración Express
│   │   ├── server.js                # Punto de entrada + Socket.IO
│   │   └── seed.js                  # Datos iniciales
│   ├── logs/                        # Logs estructurados
│   │   ├── error.log
│   │   ├── combined.log
│   │   └── security.log
│   ├── package.json
│   ├── .env                         # Variables de entorno
│   └── README.md
│
└── frontend/                         # React 19 + Vite
    ├── src/
    │   ├── api/
    │   │   └── axios.js             # Cliente HTTP configurado
    │   ├── assets/                  # Recursos estáticos
    │   ├── components/              # Componentes reutilizables
    │   │   ├── Navbar.jsx           # Navegación moderna (rediseñada)
    │   │   ├── ProtectedRoute.jsx   # HOC para rutas privadas
    │   │   ├── QuotePDF.jsx         # Template de cotización
    │   │   └── ErrorBoundary.jsx    # Captura de errores
    │   ├── context/
    │   │   └── AuthContext.jsx      # Estado global de autenticación
    │   ├── pages/                   # Páginas principales (10 páginas)
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx        # KPIs + gráficos
    │   │   ├── Users.jsx            # Gestión de usuarios (admin)
    │   │   ├── Customers.jsx        # CRUD clientes
    │   │   ├── Products.jsx         # CRUD productos
    │   │   ├── Orders.jsx           # Sistema de órdenes (rediseñado)
    │   │   ├── Quotes.jsx           # Cotizaciones
    │   │   ├── Invoices.jsx         # Facturación
    │   │   ├── Reports.jsx          # Reportes avanzados
    │   │   └── Notifications.jsx    # Centro de notificaciones
    │   ├── App.jsx                  # Routing principal
    │   ├── main.jsx                 # Punto de entrada
    │   └── index.css                # Estilos globales + Tailwind
    ├── public/                      # Archivos públicos
    ├── tailwind.config.js           # Configuración Tailwind
    ├── vite.config.js               # Configuración Vite
    ├── package.json
    ├── .env                         # Variables de entorno
    └── README.md
```

### 🔄 Flujo de Datos

```
Frontend (React)
    ↓ HTTP/WebSocket
API Gateway (Express)
    ↓ JWT Validation
Middleware Layer (Auth, Validation, Security)
    ↓ Business Logic
Controllers
    ↓ ORM (Sequelize)
Database (MySQL)
```

### 🔌 Integración de Servicios

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Cliente   │ ←───→ │   Backend   │ ←───→ │   MySQL DB  │
│  (React)    │       │  (Express)  │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
       ↓                      ↓                      ↑
       │                      │                      │
       │              ┌───────┴────────┐            │
       │              │                 │            │
       ↓              ↓                 ↓            │
┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  Socket.IO  │  │   Stripe    │  │    Logs     │ │
│  (Tiempo    │  │  (Pagos)    │  │ (Winston)   │ │
│   Real)     │  │             │  │             │ │
└─────────────┘  └─────────────┘  └─────────────┘ │
                                                    │
                        ┌──────────────────────────┘
                        │
                 ┌──────┴──────┐
                 │   Sequelize  │
                 │     ORM      │
                 └──────────────┘
```

## 🛠️ Stack Tecnológico Completo

### Backend Dependencies

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **express** | 5.2.1 | Framework web minimalista |
| **sequelize** | 6.37.7 | ORM para MySQL |
| **mysql2** | 3.16.1 | Driver MySQL para Node.js |
| **jsonwebtoken** | 9.0.3 | Generación y verificación JWT |
| **bcryptjs** | 3.0.3 | Hash de contraseñas |
| **socket.io** | 4.8.3 | WebSockets en tiempo real |
| **cors** | 2.8.5 | Configuración CORS |
| **helmet** | 8.1.0 | Seguridad HTTP headers |
| **express-rate-limit** | 8.2.1 | Protección DDoS |
| **express-validator** | 7.3.1 | Validación de requests |
| **joi** | 18.0.2 | Validación de esquemas |
| **dotenv** | 17.2.3 | Variables de entorno |
| **stripe** | 20.2.0 | Procesamiento de pagos |
| **nodemailer** | 7.0.12 | Envío de emails |
| **node-cron** | 4.2.1 | Tareas programadas |
| **axios** | 1.13.2 | Cliente HTTP |
| **date-fns** | 4.1.0 | Manipulación de fechas |
| **recharts** | 3.7.0 | Gráficos de datos |
| **nodemon** | 3.1.11 | Auto-reload en desarrollo |

### Frontend Dependencies

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **react** | 19.2.0 | UI Library con concurrent rendering |
| **react-dom** | 19.2.0 | React para el DOM |
| **react-router-dom** | 7.12.0 | Navegación SPA |
| **vite** | 7.2.4 | Build tool ultrarrápido |
| **@vitejs/plugin-react-swc** | 4.2.2 | Plugin React con SWC |
| **axios** | 1.13.2 | Cliente HTTP |
| **socket.io-client** | 4.8.3 | Cliente WebSockets |
| **tailwindcss** | 3.4.19 | Framework CSS utility-first |
| **autoprefixer** | 10.4.23 | PostCSS para prefijos CSS |
| **postcss** | 8.5.6 | Procesador CSS |
| **@heroicons/react** | 2.2.0 | Iconos SVG de Tailwind |
| **recharts** | 3.7.0 | Gráficos interactivos |
| **react-hot-toast** | 2.6.0 | Sistema de notificaciones |
| **jwt-decode** | 4.0.0 | Decodificación de JWT |
| **@stripe/react-stripe-js** | 5.4.1 | Componentes Stripe |
| **@stripe/stripe-js** | 8.6.4 | SDK Stripe |
| **eslint** | 9.39.1 | Linter JavaScript |
| **eslint-plugin-react** | - | Reglas ESLint para React |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| **Git** | Control de versiones |
| **MySQL Workbench** | Gestión de base de datos |
| **Postman** | Testing de API |
| **VS Code** | Editor de código |
| **Chrome DevTools** | Debugging frontend |
| **Node.js 18+** | Runtime JavaScript |

---

## 🚀 Instalación y Configuración Completa

### Requisitos Previos

- **Node.js** v18 o superior → [Descargar](https://nodejs.org/)
- **MySQL** 8.0 o superior → [Descargar](https://dev.mysql.com/downloads/)
- **npm** o **yarn** (incluido con Node.js)
- **Git** → [Descargar](https://git-scm.com/)
- **Editor de código** (recomendado: VS Code)

### Paso 1: Clonar el Repositorio

```bash
# Clonar proyecto
git clone <repository-url>
cd crm-lite
```

### Paso 2: Configurar Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE crm_lite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verificar creación
SHOW DATABASES;

# Salir
EXIT;
```

### Paso 3: Configurar Backend

```bash
# Navegar a carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
nano .env  # o usar tu editor favorito
```

**Contenido del `.env` Backend:**

```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crm_lite_db
DB_USER=root
DB_PASSWORD=tu_password_mysql

# JWT Secrets (genera claves seguras)
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_cambiar_en_produccion
JWT_REFRESH_SECRET=otra_clave_secreta_diferente_para_refresh_tokens
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Servidor
PORT=5000
NODE_ENV=development

# CORS - URLs permitidas
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Stripe (opcional - para pagos)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# Email (opcional - para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion

# Company Info (para documentos)
COMPANY_NAME=CRM Lite ERP
COMPANY_EMAIL=info@crmlite.com
COMPANY_PHONE=+1 (809) 555-1234
COMPANY_ADDRESS=Santo Domingo, República Dominicana
```

**Ejecutar Migraciones:**

```bash
# Migración para añadir currency a invoices
node src/migrations/add-currency-to-invoices.js

# Migración para añadir currency a quotes
node src/migrations/add-currency-to-quotes.js
```

**Poblar Base de Datos (opcional):**

```bash
# Crear usuarios de prueba
node src/seed.js

# Usuarios creados:
# admin@crm.com / admin123 (rol: admin)
# manager@crm.com / manager123 (rol: manager)
# user@crm.com / user123 (rol: user)
```

### Paso 4: Configurar Frontend

```bash
# Navegar a carpeta frontend (desde raíz del proyecto)
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env
nano .env
```

**Contenido del `.env` Frontend:**

```env
# URL del backend API
VITE_API_URL=http://localhost:5000/api

# URL de Socket.IO
VITE_SOCKET_URL=http://localhost:5000

# Stripe Public Key (opcional)
VITE_STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_de_stripe

# Entorno
VITE_ENV=development
```

### Paso 5: Ejecutar el Sistema

**Opción A: Dos terminales separadas**

```bash
# Terminal 1 - Backend
cd backend
npm start
# o con auto-reload:
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Opción B: PowerShell Windows**

```powershell
# Limpiar procesos Node previos
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Terminal 1 - Backend
cd backend; npm start

# Terminal 2 - Frontend  
cd frontend; npm run dev
```

### Paso 6: Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **Test Endpoint**: http://localhost:5000/test

**Login con usuario de prueba:**
- Email: `admin@crm.com`
- Password: `admin123`

---

## 📡 API Endpoints Completos

### 🔐 Autenticación (`/api/auth`)

```http
POST   /register           # Registro de nuevos usuarios
POST   /login              # Inicio de sesión (retorna JWT)
GET    /profile            # Perfil del usuario autenticado
POST   /refresh            # Renovar access token con refresh token
POST   /logout             # Cerrar sesión (invalidar tokens)
PUT    /change-password    # Cambiar contraseña
POST   /forgot-password    # Solicitar reset de contraseña
POST   /reset-password     # Resetear contraseña con token
```

### 👥 Usuarios (`/api/users`) - Solo Admin

```http
GET    /                   # Listar usuarios (paginado)
GET    /stats              # Estadísticas de usuarios
POST   /                   # Crear nuevo usuario
GET    /:id                # Obtener usuario por ID
PUT    /:id                # Actualizar usuario
DELETE /:id                # Eliminar usuario (soft delete)
PUT    /:id/role           # Cambiar rol de usuario
PUT    /:id/status         # Activar/desactivar usuario
```

### 👤 Clientes (`/api/customers`)

```http
GET    /                   # Listar clientes (paginado + filtros)
GET    /search             # Buscar clientes por nombre/email/teléfono
POST   /                   # Crear cliente
GET    /:id                # Obtener cliente con detalles
GET    /:id/orders         # Órdenes del cliente
GET    /:id/quotes         # Cotizaciones del cliente
GET    /:id/invoices       # Facturas del cliente
PUT    /:id                # Actualizar cliente
DELETE /:id                # Eliminar cliente (soft delete)
```

### 📦 Productos (`/api/products`)

```http
GET    /                   # Listar productos (paginado + filtros)
GET    /search             # Buscar productos por nombre/SKU
GET    /low-stock          # Productos con stock bajo
GET    /by-category/:id    # Productos por categoría
POST   /                   # Crear producto
GET    /:id                # Obtener producto
PUT    /:id                # Actualizar producto
PUT    /:id/stock          # Actualizar solo stock
DELETE /:id                # Eliminar producto
```

### 🏷️ Categorías (`/api/categories`)

```http
GET    /                   # Listar categorías
POST   /                   # Crear categoría
GET    /:id                # Obtener categoría con productos
PUT    /:id                # Actualizar categoría
DELETE /:id                # Eliminar categoría (si no tiene productos)
```

### 🛒 Órdenes (`/api/orders`)

```http
GET    /                   # Listar órdenes (paginado + filtros por estado)
GET    /stats              # Estadísticas de órdenes
GET    /search             # Buscar por número de orden
POST   /                   # Crear orden
GET    /:id                # Obtener orden con items y cliente
PUT    /:id                # Actualizar orden (estado, notas, delivery)
PUT    /:id/status         # Actualizar solo estado
PUT    /:id/delivery       # Actualizar fecha de entrega
DELETE /:id                # Cancelar orden
```

**Estados de órdenes:** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

### 📄 Cotizaciones (`/api/quotes`)

```http
GET    /                   # Listar cotizaciones (paginado)
GET    /stats              # Estadísticas de cotizaciones
GET    /company/info       # Información de la empresa para documentos
POST   /                   # Crear cotización (multimoneda)
GET    /:id                # Obtener cotización con items
PUT    /:id                # Actualizar cotización
POST   /:id/convert        # Convertir cotización a orden
POST   /:id/send-email     # Enviar cotización por email
DELETE /:id                # Eliminar cotización
```

**Monedas soportadas:** `DOP` (RD$), `USD` ($)

### 💰 Facturas (`/api/invoices`)

```http
GET    /                   # Listar facturas (paginado + filtros)
GET    /stats              # Estadísticas de facturación
GET    /overdue            # Facturas vencidas
POST   /                   # Crear factura (from order)
GET    /:id                # Obtener factura con items y pagos
PUT    /:id                # Actualizar factura
PUT    /:id/status         # Cambiar estado de factura
POST   /:id/send-email     # Enviar factura por email
DELETE /:id                # Anular factura
```

**Estados:** `pending`, `paid`, `overdue`, `cancelled`

### 💳 Pagos (`/api/payments`)

```http
GET    /                   # Listar pagos (paginado)
GET    /methods            # Listar métodos de pago activos
POST   /methods            # Crear método de pago
PUT    /methods/:id        # Actualizar método de pago
DELETE /methods/:id        # Eliminar método de pago
POST   /                   # Registrar pago
GET    /:id                # Obtener detalles de pago
POST   /:id/refund         # Procesar reembolso
```

### 🔔 Notificaciones (`/api/notifications`)

```http
GET    /                   # Listar notificaciones del usuario (paginado)
GET    /unread-count       # Contador de notificaciones no leídas
GET    /recent             # Últimas 10 notificaciones
PUT    /:id/read           # Marcar notificación como leída
PUT    /mark-all-read      # Marcar todas como leídas
DELETE /:id                # Eliminar notificación
DELETE /delete-all-read    # Eliminar todas las leídas
```

### 📊 Dashboard (`/api/dashboard`)

```http
GET    /stats              # KPIs principales (ventas, clientes, productos, órdenes)
GET    /recent-activity    # Actividad reciente del sistema
GET    /charts-data        # Datos para gráficos (ventas, estados)
GET    /top-products       # Top 5 productos más vendidos
GET    /top-customers      # Top 5 clientes por compras
```

### 📈 Reportes (`/api/reports`)

```http
GET    /sales              # Reporte de ventas (filtros: dateFrom, dateTo)
GET    /inventory          # Reporte de inventario con alertas
GET    /customers          # Reporte de clientes con métricas
GET    /charts             # Datos para gráficos (dashboard)
GET    /financial          # Reporte financiero detallado
POST   /export/pdf         # Exportar reporte a PDF
POST   /export/excel       # Exportar reporte a Excel
```

### 💳 Stripe (`/api/stripe`)

```http
POST   /create-payment-intent     # Crear intención de pago
POST   /webhook                   # Webhook de eventos Stripe
GET    /payment-methods           # Listar métodos guardados
POST   /attach-payment-method     # Adjuntar método de pago
DELETE /detach-payment-method/:id # Eliminar método de pago
```

---

## 🗄️ Modelos de Base de Datos

### Esquema Completo con Campos

#### 👤 User
```javascript
{
  id: UUID (PK),
  name: STRING(100),
  email: STRING(100) UNIQUE,
  password: STRING (hashed),
  role: ENUM('admin', 'manager', 'user'),
  isActive: BOOLEAN,
  lastLogin: DATE,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 👥 Customer
```javascript
{
  id: UUID (PK),
  name: STRING(100),
  email: STRING(100),
  phone: STRING(20),
  company: STRING(100),
  cedula: STRING(20),  // RD ID
  address: TEXT,
  city: STRING(50),
  country: STRING(50),
  creditLimit: DECIMAL(10,2),
  currentDebt: DECIMAL(10,2),
  isActive: BOOLEAN,
  userId: UUID (FK -> User),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 📦 Product
```javascript
{
  id: UUID (PK),
  name: STRING(150),
  sku: STRING(50) UNIQUE,
  description: TEXT,
  price: DECIMAL(10,2),
  cost: DECIMAL(10,2),
  stock: INTEGER,
  minStock: INTEGER,
  unit: STRING(20),  // unidad, caja, kg, etc.
  categoryId: UUID (FK -> Category),
  userId: UUID (FK -> User),
  isActive: BOOLEAN,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 🏷️ Category
```javascript
{
  id: UUID (PK),
  name: STRING(100),
  description: TEXT,
  userId: UUID (FK -> User),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 🛒 Order
```javascript
{
  id: UUID (PK),
  orderNumber: STRING(20) UNIQUE,  // ORD-001
  customerId: UUID (FK -> Customer),
  userId: UUID (FK -> User),
  totalAmount: DECIMAL(10,2),
  tax: DECIMAL(10,2),
  subtotal: DECIMAL(10,2),
  status: ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
  deliveryDate: DATE,
  notes: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 📦 OrderItem
```javascript
{
  id: UUID (PK),
  orderId: UUID (FK -> Order),
  productId: UUID (FK -> Product),
  quantity: INTEGER,
  price: DECIMAL(10,2),  // Precio en momento de venta
  discount: DECIMAL(5,2),  // Porcentaje
  subtotal: DECIMAL(10,2),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 📄 Quote
```javascript
{
  id: UUID (PK),
  quoteNumber: STRING(20) UNIQUE,  // QTE-001
  customerId: UUID (FK -> Customer),
  customerName: STRING(100),  // Para clientes no registrados
  customerEmail: STRING(100),
  userId: UUID (FK -> User),
  totalAmount: DECIMAL(10,2),
  tax: DECIMAL(10,2),
  subtotal: DECIMAL(10,2),
  currency: ENUM('DOP', 'USD'),
  status: ENUM('draft', 'sent', 'accepted', 'rejected'),
  validUntil: DATE,
  notes: TEXT,
  termsAndConditions: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 📦 QuoteItem
```javascript
{
  id: UUID (PK),
  quoteId: UUID (FK -> Quote),
  productId: UUID (FK -> Product),
  productName: STRING(150),
  description: TEXT,
  quantity: INTEGER,
  price: DECIMAL(10,2),
  discount: DECIMAL(5,2),
  subtotal: DECIMAL(10,2),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 💰 Invoice
```javascript
{
  id: UUID (PK),
  invoiceNumber: STRING(20) UNIQUE,  // INV-001
  orderId: UUID (FK -> Order),
  customerId: UUID (FK -> Customer),
  userId: UUID (FK -> User),
  totalAmount: DECIMAL(10,2),
  tax: DECIMAL(10,2),  // ITBIS 18%
  subtotal: DECIMAL(10,2),
  currency: ENUM('DOP', 'USD'),
  status: ENUM('pending', 'paid', 'overdue', 'cancelled'),
  issueDate: DATE,
  dueDate: DATE,
  paidDate: DATE,
  notes: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 📦 InvoiceItem
```javascript
{
  id: UUID (PK),
  invoiceId: UUID (FK -> Invoice),
  description: STRING(255),
  quantity: INTEGER,
  price: DECIMAL(10,2),
  discount: DECIMAL(5,2),
  subtotal: DECIMAL(10,2),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 💳 Payment
```javascript
{
  id: UUID (PK),
  orderId: UUID (FK -> Order),
  invoiceId: UUID (FK -> Invoice),
  userId: UUID (FK -> User),
  amount: DECIMAL(10,2),
  methodId: UUID (FK -> PaymentMethod),
  transactionId: STRING(100),  // ID de Stripe, banco, etc.
  status: ENUM('pending', 'completed', 'failed', 'refunded'),
  paymentDate: DATE,
  notes: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 💳 PaymentMethod
```javascript
{
  id: UUID (PK),
  name: STRING(50),  // Efectivo, Tarjeta, Transferencia
  type: ENUM('cash', 'card', 'transfer', 'check', 'stripe'),
  isActive: BOOLEAN,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 💸 PaymentTransaction
```javascript
{
  id: UUID (PK),
  paymentId: UUID (FK -> Payment),
  transactionType: ENUM('charge', 'refund'),
  amount: DECIMAL(10,2),
  stripePaymentIntentId: STRING(100),
  status: STRING(50),
  metadata: JSON,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### 🔔 Notification
```javascript
{
  id: UUID (PK),
  userId: UUID (FK -> User),
  title: STRING(150),
  message: TEXT,
  type: ENUM('success', 'info', 'warning', 'error'),
  priority: ENUM('low', 'medium', 'high', 'critical'),
  isRead: BOOLEAN,
  readAt: DATE,
  entityType: STRING(50),  // order, invoice, product, etc.
  entityId: UUID,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Relaciones del Modelo

```
User (1) ──── (N) Customer
User (1) ──── (N) Product
User (1) ──── (N) Order
User (1) ──── (N) Quote
User (1) ──── (N) Invoice
User (1) ──── (N) Payment
User (1) ──── (N) Notification
User (1) ──── (N) Category

Customer (1) ──── (N) Order
Customer (1) ──── (N) Quote
Customer (1) ──── (N) Invoice

Order (1) ──── (N) OrderItem
Order (1) ──── (N) Invoice
Order (1) ──── (N) Payment

Quote (1) ──── (N) QuoteItem

Invoice (1) ──── (N) InvoiceItem
Invoice (1) ──── (N) Payment

Product (1) ──── (N) OrderItem
Product (1) ──── (N) QuoteItem
Product (N) ──── (1) Category

Payment (N) ──── (1) PaymentMethod
Payment (1) ──── (N) PaymentTransaction
```

---

## 📱 Páginas Frontend Detalladas

### 1. 🔐 Login (`/login`)
**Características:**
- Formulario con email y contraseña
- Validación en tiempo real
- Mensajes de error claros
- Remember me (localStorage)
- Link a recuperar contraseña
- Diseño moderno con gradientes

### 2. 📊 Dashboard (`/`)
**Características:**
- 4 KPI cards: Ventas, Clientes, Productos, Órdenes
- Gráfico de barras: Ventas mensuales (últimos 6 meses)
- Gráfico de pie: Estados de órdenes con datos reales
- Tabla de actividad reciente
- Notificaciones en tiempo real (Socket.IO)
- Permisos diferenciados por rol
- Actualización automática cada 30 segundos

**KPIs mostrados:**
- 💰 Ventas Totales (suma de órdenes delivered)
- 👥 Total Clientes (clientes activos)
- 📦 Productos en Stock (inventario disponible)
- 🛒 Órdenes Pendientes (requieren atención)

### 3. 👥 Usuarios (`/users`) - Solo Admin
**Características:**
- Tabla con búsqueda y filtros
- Crear/editar usuarios con modal
- Cambiar rol (admin, manager, user)
- Activar/desactivar usuarios
- Ver último login
- Estadísticas de usuarios por rol
- Validación de email único

### 4. 👤 Clientes (`/customers`)
**Características:**
- Lista paginada de clientes
- Búsqueda por nombre, email, cédula
- Filtros por estado (activo/inactivo)
- Modal de creación/edición
- Validación de cédula dominicana
- Ver historial de compras
- Límite de crédito y deuda actual
- Soft delete (preservar datos)

### 5. 📦 Productos (`/products`)
**Características:**
- Grid/lista de productos con imágenes
- Búsqueda por nombre/SKU
- Filtros por categoría y stock
- Alertas de stock bajo (rojo)
- Modal de creación/edición
- Gestión de categorías
- Actualización rápida de stock
- Cálculo de margen (precio - costo)

### 6. 🛒 Órdenes (`/orders`) - **Rediseñado**
**Características:**
- **Stats cards modernos** con gradientes
  - Total Órdenes con icono de carrito
  - Órdenes Pendientes en amarillo
  - Entregadas en verde
  - Ingresos Totales en morado
- **Búsqueda avanzada** por:
  - Número de orden
  - Nombre del cliente
  - Email del cliente
- **Filtro por estado** con dropdown:
  - Todos
  - Pendiente (pending)
  - Confirmado (confirmed)
  - Procesando (processing)
  - Enviado (shipped)
  - Entregado (delivered)
  - Cancelado (cancelled)
- **Tabla moderna** con:
  - Número de orden destacado
  - Cliente con email
  - Monto con formato monetario
  - Estado con badge de colores
  - Fecha de entrega
  - Acciones: Ver, Editar, Eliminar
- **Modal de edición** con:
  - Actualizar estado (dropdown)
  - Cambiar fecha de entrega (date picker)
  - Agregar/editar notas
  - Botones: Cancelar / Guardar Cambios
- **Eliminación con confirmación**
  - `window.confirm()` antes de eliminar
  - Toast de éxito/error
- **Notificaciones toast** (react-hot-toast)
  - Orden creada ✅
  - Orden actualizada ✏️
  - Orden eliminada 🗑️
  - Errores en rojo ❌
- **Diseño visual:**
  - Fondo degradado: from-gray-50 to-gray-100
  - Cards con sombras: shadow-lg
  - Headers con gradientes: indigo-purple
  - Botones con hover effects
  - Íconos de Heroicons

### 7. 📄 Cotizaciones (`/quotes`)
**Características:**
- Lista de cotizaciones con filtros
- **Selector de moneda**: DOP (RD$) o USD ($)
- Formulario multi-paso:
  1. Información del cliente (existente o nuevo)
  2. Selección de productos con cantidades
  3. Resumen y confirmación
- **Vista previa modal** para impresión
  - Diseño profesional tipo factura
  - Logo y datos de empresa
  - Tabla de productos detallada
  - Cálculo de subtotal, impuesto, total
  - Términos y condiciones
  - CSS optimizado para @page A4/Carta
- **Conversión a orden** con un clic
- Envío por email (opcional)
- Estados con colores: draft, sent, accepted, rejected
- Validez configurable (días)

### 8. 💰 Facturación (`/invoices`)
**Características:**
- Lista de facturas con filtros
- **Multimoneda**: DOP y USD
- Crear factura desde orden
- **ITBIS 18%** automático
- Estados con badges:
  - Pendiente (amarillo)
  - Pagada (verde)
  - Vencida (rojo)
  - Cancelada (gris)
- **Template de impresión profesional**
- Registro de pagos vinculados
- Fechas: emisión, vencimiento, pago
- Anular factura (admin)
- Exportar a PDF

### 9. 📈 Reportes (`/reports`)
**Características:**
- **Reporte de ventas**:
  - Filtros por rango de fechas
  - Gráfico de tendencia
  - Total de ventas por período
  - Comparación con período anterior
- **Reporte de inventario**:
  - Productos con stock bajo
  - Valor total del inventario
  - Productos más/menos vendidos
  - Alertas de reposición
- **Reporte de clientes**:
  - Top clientes por compras
  - Clientes nuevos vs recurrentes
  - Análisis de deuda y crédito
- **Exportación**:
  - PDF para impresión
  - Excel para análisis
- **Gráficos interactivos** (Recharts):
  - Bar charts
  - Line charts
  - Pie charts
  - Area charts

### 10. 🔔 Notificaciones (`/notifications`)
**Características:**
- Centro de notificaciones
- Lista paginada con scroll infinito
- **27 tipos de notificaciones**:
  - Nuevas órdenes
  - Cambios de estado
  - Stock bajo
  - Facturas vencidas
  - Pagos recibidos
  - Cotizaciones aceptadas/rechazadas
  - Alertas del sistema
- **Filtros**:
  - Todas
  - No leídas
  - Por tipo (success, info, warning, error)
  - Por prioridad (low, medium, high, critical)
- **Acciones**:
  - Marcar como leída (individual)
  - Marcar todas como leídas
  - Eliminar notificación
  - Eliminar todas las leídas
- **Iconos por tipo**:
  - ✅ Success - Verde
  - ℹ️ Info - Azul
  - ⚠️ Warning - Amarillo
  - ❌ Error - Rojo
- **Actualización en tiempo real** vía Socket.IO

---

## 🎨 Componentes Reutilizables

### Navbar.jsx - **Rediseñado**
**Características nuevas:**
- ✨ **Gradiente moderno**: slate-900 → slate-800 → slate-900
- 🎨 **Logo mejorado**:
  - Icono sparkles con fondo degradado indigo-purple
  - Texto "CRM Lite" con gradiente de color
  - Subtítulo "ERP System" en mayúsculas pequeñas
- 👤 **Menú de usuario**:
  - Avatar circular con icono UserCircleIcon
  - Nombre y email del usuario
  - **Badge de rol con colores**:
    - Admin: Purple-Pink gradient
    - Manager: Blue-Cyan gradient
    - User: Green-Emerald gradient
  - Dropdown con:
    - Perfil
    - Configuración
    - Cerrar sesión con icono
- 🔔 **Notificaciones mejoradas**:
  - Badge con número de no leídas
  - Animación pulse en badge
  - Hover effect en botón
- 📱 **Menú móvil hamburguesa**:
  - Icono Bars3Icon / XMarkIcon
  - Slide-down con backdrop
  - Todos los enlaces principales
  - Perfil de usuario en mobile
  - Cerrar sesión en rojo
- 🎯 **Estado activo**:
  - Gradiente indigo-purple para página actual
  - Texto blanco en activo
  - Hover suave en inactivos
- ⚡ **Transiciones**:
  - `transition-all duration-300`
  - Smooth hover effects
  - Rotate en chevron de dropdown
- 📏 **Responsive breakpoints**:
  - Desktop (lg): Navegación horizontal completa
  - Tablet (md): Navegación compacta
  - Mobile (<lg): Menú hamburguesa

### ProtectedRoute.jsx
**Características:**
- HOC para proteger rutas privadas
- Verificación de token en localStorage
- Redirect a login si no autenticado
- Verificación de rol (opcional)
- Loading state mientras valida

### QuotePDF.jsx
**Características:**
- Template de cotización profesional
- Diseño optimizado para A4 y Carta
- Soporte multimoneda
- Tabla de productos con estilos
- Cálculos automáticos
- CSS específico para impresión

### ErrorBoundary.jsx
**Características:**
- Captura errores de React
- UI de fallback amigable
- Log de errores para debugging
- Botón para recargar página
- Previene crash de toda la app

---

## 🔐 Roles y Permisos Detallados

### Matriz de Permisos

| Recurso | Admin | Manager | User |
|---------|-------|---------|------|
| **Usuarios** |
| Ver lista | ✅ | ❌ | ❌ |
| Crear | ✅ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ |
| Cambiar rol | ✅ | ❌ | ❌ |
| **Clientes** |
| Ver lista | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ❌ | ❌ |
| **Productos** |
| Ver lista | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ❌ | ❌ |
| Actualizar stock | ✅ | ✅ | ✅ |
| **Órdenes** |
| Ver lista | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ❌ |
| Cancelar | ✅ | ✅ | ❌ |
| Cambiar estado | ✅ | ✅ | ❌ |
| **Cotizaciones** |
| Ver lista | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ✅ | ❌ |
| Convertir a orden | ✅ | ✅ | ❌ |
| **Facturas** |
| Ver lista | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ❌ |
| Anular | ✅ | ❌ | ❌ |
| **Pagos** |
| Ver lista | ✅ | ✅ | ✅ |
| Registrar | ✅ | ✅ | ❌ |
| Reembolsar | ✅ | ❌ | ❌ |
| **Reportes** |
| Ver reportes | ✅ | ✅ | ✅ (limitado) |
| Exportar | ✅ | ✅ | ❌ |
| **Dashboard** |
| Ver KPIs completos | ✅ | ✅ | ❌ |
| Ver KPIs básicos | ✅ | ✅ | ✅ |
| Ver gráficos | ✅ | ✅ | ❌ |

---

## 🧪 Testing y Calidad

### Testing Manual

**Autenticación:**
```bash
# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123","role":"user"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"admin123"}'

# Respuesta:
# { "token": "eyJhbGc...", "refreshToken": "eyJhbGc...", "user": {...} }
```

**Endpoints Protegidos:**
```bash
# Obtener clientes (con token)
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer <tu_token_jwt>"

# Crear orden
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid-del-cliente",
    "items": [
      {"productId": "uuid-producto", "quantity": 2, "price": 100}
    ]
  }'
```

**Health Checks:**
```bash
# Backend health
curl http://localhost:5000/health

# Test endpoint
curl http://localhost:5000/test

# Database check
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

### Testing Automatizado (Planificado)

```javascript
// Ejemplo de test unitario (Jest)
describe('Auth Controller', () => {
  test('should register new user', async () => {
    const user = {
      name: 'Test',
      email: 'test@test.com',
      password: 'test123'
    };
    const response = await request(app)
      .post('/api/auth/register')
      .send(user)
      .expect(201);
    
    expect(response.body).toHaveProperty('token');
  });
});
```

---

## 🐛 Troubleshooting Completo

### Problema: Backend no inicia

**Error:** `SequelizeConnectionError: Access denied for user`
```bash
# Solución:
# 1. Verificar credenciales en .env
DB_USER=root
DB_PASSWORD=tu_password_correcto

# 2. Verificar que MySQL está corriendo
# Windows:
net start MySQL80

# Linux:
sudo service mysql status
sudo service mysql start

# 3. Verificar que la base de datos existe
mysql -u root -p
SHOW DATABASES;
USE crm_lite_db;
```

**Error:** `Port 5000 already in use`
```powershell
# Windows PowerShell:
Get-Process -Name node | Stop-Process -Force

# Linux/Mac:
lsof -ti:5000 | xargs kill -9

# O cambiar puerto en .env:
PORT=5001
```

**Error:** `Column 'currency' doesn't exist in table 'invoices'`
```bash
# Ejecutar migración:
cd backend
node src/migrations/add-currency-to-invoices.js
node src/migrations/add-currency-to-quotes.js
```

### Problema: Frontend no carga

**Error:** `Network Error` al hacer login
```bash
# Verificar:
# 1. Backend está corriendo en puerto 5000
curl http://localhost:5000/health

# 2. VITE_API_URL es correcto en frontend/.env
VITE_API_URL=http://localhost:5000/api

# 3. CORS habilitado en backend
# backend/src/app.js línea 27:
origin: ['http://localhost:5173', 'http://localhost:5174']
```

**Error:** `Module not found: Can't resolve '@heroicons/react'`
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm install @heroicons/react react-hot-toast
```

**Error:** Vite no compila
```bash
# Limpiar caché de Vite:
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Problema: Autenticación

**Error:** `Token expired`
- Usuario debe volver a iniciar sesión
- Los access tokens expiran en 15 minutos
- Usar refresh token para renovar

**Error:** `Invalid token`
```javascript
// Limpiar localStorage en navegador:
localStorage.clear();
// O en consola del navegador:
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
```

**Error:** Usuario no puede acceder a recursos
- Verificar rol del usuario (admin/manager/user)
- Verificar middleware de permisos en backend
- Consultar matriz de permisos arriba

### Problema: Base de Datos

**Error:** Too many connections
```sql
-- Aumentar límite de conexiones:
SET GLOBAL max_connections = 200;

-- Verificar pool de Sequelize en backend/src/config/db.js:
pool: {
  max: 10,  -- Reducir si es necesario
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

**Error:** Datos inconsistentes
```bash
# Resetear base de datos:
mysql -u root -p
DROP DATABASE crm_lite_db;
CREATE DATABASE crm_lite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Volver a sincronizar:
cd backend
node src/seed.js
```

### Problema: Socket.IO

**Error:** Notificaciones no llegan en tiempo real
```javascript
// Verificar conexión en Dashboard.jsx:
useEffect(() => {
  const socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token: localStorage.getItem('token') }
  });
  
  socket.on('connect', () => {
    console.log('✅ Conectado a Socket.IO');
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Desconectado de Socket.IO');
  });
  
  // Verificar en consola del navegador
}, []);
```

### Problema: Stripe

**Error:** Pagos no se procesan
```bash
# Modo simulación para países sin Stripe:
# frontend/src/pages/Invoices.jsx
const simulatePayment = true;  // Cambiar a true

# O configurar claves reales de Stripe:
# backend/.env:
STRIPE_SECRET_KEY=sk_live_...

# frontend/.env:
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 📞 Comandos Útiles

### Backend

```bash
# Iniciar servidor producción
npm start

# Iniciar con auto-reload (desarrollo)
npm run dev

# Ejecutar migraciones
node src/migrations/add-currency-to-invoices.js
node src/migrations/add-currency-to-quotes.js

# Poblar base de datos
node src/seed.js

# Ver logs
tail -f logs/error.log
tail -f logs/combined.log
tail -f logs/security.log

# Matar procesos Node
# Windows:
Get-Process -Name node | Stop-Process -Force

# Linux/Mac:
killall node
```

### Frontend

```bash
# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Limpiar caché
rm -rf node_modules/.vite
rm -rf dist
```

### MySQL

```bash
# Conectarse a MySQL
mysql -u root -p

# Seleccionar base de datos
USE crm_lite_db;

# Ver tablas
SHOW TABLES;

# Ver estructura de tabla
DESCRIBE users;
DESCRIBE orders;

# Backup de base de datos
mysqldump -u root -p crm_lite_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -p crm_lite_db < backup_20260125.sql

# Ver usuarios
SELECT * FROM users;

# Ver últimas órdenes
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 10;

# Ver notificaciones no leídas
SELECT * FROM notifications WHERE isRead = 0;
```

### Git

```bash
# Estado del repositorio
git status

# Ver cambios
git diff

# Agregar cambios
git add .

# Commit
git commit -m "feat: agregar nueva funcionalidad"

# Push
git push origin master

# Pull
git pull origin master

# Ver historial
git log --oneline --graph --all
```

---

## 📚 Documentación Adicional

### Documentos del Proyecto

- 📖 [Backend README](./backend/README.md) - API completa del backend
- 📖 [Frontend README](./frontend/README.md) - Guía de componentes
- 📋 [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) - Documentación técnica completa
- 🚀 [QUICK_START.md](./QUICK_START.md) - Guía rápida para desarrolladores
- 🔔 [SISTEMA_NOTIFICACIONES.md](./SISTEMA_NOTIFICACIONES.md) - Sistema de notificaciones
- 📊 [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - Índice de documentación

---

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas

**Alta Prioridad:**
- [ ] 📧 Sistema de emails automatizado
  - Bienvenida a nuevos usuarios
  - Reseteo de contraseña
  - Envío de cotizaciones
  - Facturas por email
  - Alertas de stock bajo
- [ ] 📱 Notificaciones push (PWA)
- [ ] 📄 Exportación de reportes a PDF/Excel
- [ ] 🔍 Búsqueda global (clientes, productos, órdenes)
- [ ] 📸 Subida de imágenes de productos (AWS S3 / Cloudinary)

**Media Prioridad:**
- [ ] 🎨 Tema claro/oscuro
- [ ] 🌐 Soporte multi-idioma (i18n): Español, Inglés
- [ ] 📊 Dashboard personalizable por usuario
- [ ] 👥 Sistema de equipos y permisos granulares
- [ ] 📱 Código QR para órdenes y productos
- [ ] 💬 Chat interno entre usuarios
- [ ] 📅 Calendario de entregas

**Baja Prioridad:**
- [ ] 📱 Aplicación móvil (React Native)
- [ ] 🤖 Chatbot de soporte con IA
- [ ] 📈 Analytics avanzado con Google Analytics
- [ ] 🔄 Sincronización offline (Service Worker)
- [ ] 🎯 Business Intelligence con gráficos avanzados
- [ ] 🔗 Integración con QuickBooks / SAP
- [ ] 📦 Sistema de envíos (DHL, FedEx, UPS)

### Mejoras Técnicas

**DevOps y Testing:**
- [ ] 🧪 Tests unitarios completos (Jest + Supertest)
- [ ] 🧪 Tests E2E (Playwright / Cypress)
- [ ] 🐳 Dockerización completa (Docker Compose)
- [ ] ☸️ Kubernetes deployment
- [ ] 🚀 CI/CD con GitHub Actions
- [ ] 📊 Monitoring con Prometheus + Grafana
- [ ] 🔍 APM con New Relic / DataDog

**Arquitectura:**
- [ ] 📝 Swagger/OpenAPI documentation
- [ ] 🔐 OAuth2 / SSO integration (Google, Microsoft)
- [ ] ⚡ Redis para caché distribuido
- [ ] 📡 GraphQL API (alternativa a REST)
- [ ] 🔄 Migración a TypeScript (backend y frontend)
- [ ] 🏗️ Microservicios (separar módulos)
- [ ] 🔄 Event-driven architecture (RabbitMQ / Kafka)

**Seguridad:**
- [ ] 🔐 Two-factor authentication (2FA)
- [ ] 🔒 Encriptación de datos sensibles
- [ ] 🛡️ Web Application Firewall (WAF)
- [ ] 📊 Audit logs completos
- [ ] 🔍 Penetration testing
- [ ] 📜 Compliance GDPR

---

## 🤝 Contribución

### Guía para Contribuidores

1. **Fork el proyecto**
```bash
git clone <tu-fork-url>
cd crm-lite
```

2. **Crear rama de feature**
```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
```

3. **Hacer cambios y commit**
```bash
git add .
git commit -m "feat: agregar sistema de emails"
# Usar conventional commits:
# feat: nueva funcionalidad
# fix: corrección de bug
# docs: cambios en documentación
# style: formato, punto y coma faltante, etc.
# refactor: refactorización de código
# test: agregar tests
# chore: tareas de mantenimiento
```

4. **Push a tu fork**
```bash
git push origin feature/nueva-funcionalidad
```

5. **Abrir Pull Request**
- Ir a GitHub
- Clic en "New Pull Request"
- Describir cambios detalladamente
- Esperar revisión

### Convenciones de Código

**JavaScript/JSX:**
```javascript
// Variables: camelCase
const userName = "John";
const isActive = true;

// Funciones: camelCase
function getUserById(id) {
  return users.find(u => u.id === id);
}

// Componentes React: PascalCase
function UserProfile({ user }) {
  return <div>{user.name}</div>;
}

// Constantes: UPPER_SNAKE_CASE
const API_URL = "http://localhost:5000";
const MAX_RETRIES = 3;

// Archivos: kebab-case.jsx
// user-profile.jsx
// order-list.jsx
```

**Sequelize Models:**
```javascript
// Modelos: PascalCase singular
const User = sequelize.define('User', {});
const Order = sequelize.define('Order', {});

// Tablas: PascalCase plural automático
// Users, Orders, OrderItems
```

**Rutas:**
```javascript
// Archivos: kebab-case
// auth.routes.js
// customer.routes.js

// Endpoints: kebab-case
// /api/auth/login
// /api/customers/search
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

```
MIT License

Copyright (c) 2026 Andy Rosado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contacto

**Andy Rosado**  
Ingeniero de Sistemas | Full Stack Developer  
República Dominicana

- 💼 **LinkedIn:** [Tu LinkedIn]
- 📧 **Email:** [Tu Email]
- 🐙 **GitHub:** [Tu GitHub]
- 🌐 **Portfolio:** [Tu Portfolio]
- 📱 **WhatsApp:** +1 (809) XXX-XXXX

---

## 🎉 Agradecimientos

Este proyecto fue posible gracias a:

- **React Team** - Por React 19 con mejoras de concurrencia
- **Express.js Community** - Framework web minimalista
- **Sequelize Team** - ORM potente y flexible
- **Tailwind CSS** - Framework CSS utility-first
- **Heroicons** - Iconos SVG hermosos
- **Recharts** - Librería de gráficos React
- **Socket.IO** - WebSockets en tiempo real
- **Stripe** - Procesamiento de pagos
- **Vite Team** - Build tool ultrarrápido
- **Todos los contribuidores de código abierto**

---

## 📊 Estadísticas del Proyecto

```
📁 Estructura:
   - Backend: 15 controladores, 15 modelos, 13 rutas
   - Frontend: 10 páginas, 5 componentes
   - Total de archivos: ~100+

💻 Líneas de Código:
   - Backend: ~8,000 líneas
   - Frontend: ~7,000 líneas
   - Total: ~15,000+ líneas

🗄️ Base de Datos:
   - Tablas: 15 principales
   - Relaciones: 20+ definidas
   - Índices: Optimizados

📡 API Endpoints:
   - Total: ~60 endpoints REST
   - WebSocket: 1 conexión (Socket.IO)

🔐 Seguridad:
   - Autenticación: JWT
   - Roles: 3 (admin, manager, user)
   - Rate Limiting: 100 req/15min
   - Validación: Joi en todos los endpoints

⚡ Performance:
   - Caché: En memoria con TTL
   - Pool MySQL: Max 10 conexiones
   - Build time: ~3s (Vite)

🧪 Cobertura:
   - Tests unitarios: Planificado
   - Tests E2E: Planificado
   - Coverage objetivo: 80%+
```

---

## 🏆 Características Destacadas

### ✅ Completamente Funcional
- Sistema 100% operativo en desarrollo
- Sin dependencias externas críticas
- Todas las funcionalidades principales implementadas

### ✅ Código Limpio
- Arquitectura MVC bien definida
- Separación de responsabilidades
- Código comentado y documentado
- Convenciones consistentes

### ✅ Seguro
- Autenticación robusta con JWT
- Protección contra ataques comunes (XSS, SQL Injection, DDoS)
- Roles y permisos granulares
- Logging de seguridad

### ✅ Escalable
- Pool de conexiones optimizado
- Caché en memoria
- Paginación en todos los listados
- Code splitting en frontend

### ✅ Moderno
- React 19 con últimas características
- Express 5.2.1 estable
- UI/UX profesional con Tailwind
- WebSockets para tiempo real

---

## 📝 Changelog

### Versión 2.0 (Enero 2026)

**🎨 UI/UX:**
- Navbar completamente rediseñado con gradientes modernos
- Logo con icono sparkles y texto degradado
- Badges de rol personalizados por colores
- Menú de usuario con avatar y dropdown
- Menú móvil hamburguesa responsive
- Página de Órdenes rediseñada con stats cards y modals

**🔔 Notificaciones:**
- Sistema de notificaciones en tiempo real (Socket.IO)
- 27 tipos de notificaciones implementadas
- Centro de notificaciones con filtros
- Badge animado con contador

**💰 Facturación:**
- Soporte multimoneda (DOP/USD)
- Migraciones de base de datos ejecutadas
- Templates de impresión profesionales

**🛒 Órdenes:**
- Modal de edición moderna
- Eliminación con confirmación
- Notificaciones toast (react-hot-toast)
- Stats cards con gradientes

**📊 Dashboard:**
- Gráfico de pie chart con datos reales del backend
- Mejoras en labels y tooltips
- Empty state para gráficos sin datos

**🔧 Backend:**
- Ruta /api/users agregada y registrada
- Sistema de logging mejorado
- Validación Joi en todos los endpoints

### Versión 1.0 (Diciembre 2025)

**Lanzamiento Inicial:**
- Sistema básico de autenticación
- CRUD de clientes, productos, órdenes
- Dashboard con KPIs básicos
- Reportes simples

---

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub**

**Made with ❤️ in República Dominicana 🇩🇴**

**🚀 Happy Coding!**


## 👥 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@crm-lite.com | Admin123!@# | admin |
| manager@crm-lite.com | Manager123!@# | manager |
| user@crm-lite.com | User123!@# | user |

## 🔧 Stack Tecnológico

**Backend:**
- Node.js + Express 5.2.1
- MySQL 8.0+ con Sequelize ORM
- JWT para autenticación
- Joi para validación
- Socket.IO para tiempo real
- Stripe (con modo simulación)
- Bcrypt para encriptación

**Frontend:**
- React 19.2.0 con Vite 7.3.1
- Tailwind CSS 3.4
- Axios para HTTP
- React Router DOM v7
- Heroicons 2.2
- React Hot Toast para notificaciones
- Recharts para gráficos

**Base de Datos:**
- MySQL 8.0+
- Sequelize ORM
- Transacciones ACID

## 💡 Características Técnicas

### Pagos y Facturación
- Integración con Stripe para pagos con tarjeta
- Modo de simulación para desarrollo y países sin Stripe
- Cálculo automático de comisiones (2.9% + $0.30)
- Soporte multi-moneda (DOP/USD)
- Generación de facturas en formato profesional
- Sistema de impresión optimizado para A4/Carta

### Cotizaciones
- Generación de documentos profesionales
- Vista modal centrada para mejor visualización
- Exportación a PDF
- Conversión automática a órdenes
- Estados: borrador, enviada, aprobada, rechazada, expirada

### Seguridad
- Tokens JWT con expiración
- Rate limiting para prevenir abuso
- Helmet para headers de seguridad
- Sanitización de inputs
- CORS configurado
- Validación de datos con Joi

## 📋 Variables de Entorno Requeridas

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=crm_lite_db
DB_PORT=3306

# JWT
JWT_SECRET=tu_secret_key_muy_segura

# Puerto
PORT=5000

# Stripe (Opcional - usar modo simulación)
PAYMENT_SIMULATION_MODE=true
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📝 Versión y Actualizaciones

**Versión Actual: 2.0.0** - Enero 2026

### Últimas Actualizaciones (v2.0.0)
- ✨ Sistema multi-moneda (DOP/USD) en cotizaciones y facturas
- 🖨️ Documentos profesionales con formato optimizado para impresión
- 💳 Modo de simulación de pagos para República Dominicana
- 📄 Vista modal centrada para cotizaciones
- 🎨 Mejoras en UI/UX con diseños profesionales
- 🔧 Optimizaciones de rendimiento y caché

### Roadmap Futuro
- [ ] Integración con Azul/Cardnet para RD
- [ ] Reportes avanzados con filtros
- [ ] App móvil
- [ ] API pública con documentación Swagger
- [ ] Multi-tenancy

## 📞 Contacto y Soporte

**Desarrollado por:** Andy Rosado  
**Rol:** Ingeniero de Sistemas | Desarrollador Web Full Stack  
**Ubicación:** República Dominicana  

---

© 2026 CRM Lite ERP. Desarrollado por Andy Rosado. Todos los derechos reservados.
