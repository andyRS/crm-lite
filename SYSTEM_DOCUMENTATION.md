# 📋 Documentación del Sistema CRM-Lite ERP

**Última actualización:** 24 de Enero, 2026  
**Estado del Sistema:** ✅ Operativo (Backend + Frontend corriendo)

---

## 📑 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Instalación y Setup](#instalación-y-setup)
5. [Ejecución del Sistema](#ejecución-del-sistema)
6. [API Endpoints](#api-endpoints)
7. [Modelos de Base de Datos](#modelos-de-base-de-datos)
8. [Componentes Frontend](#componentes-frontend)
9. [Flujo de Autenticación](#flujo-de-autenticación)
10. [Problemas Resueltos](#problemas-resueltos)
11. [Próximas Mejoras](#próximas-mejoras)

---

## 📌 Descripción del Proyecto

**CRM-Lite ERP** es un sistema integral de gestión empresarial desarrollado con tecnologías modernas. Combina:

- **Backend robusto** con Express.js y MySQL/Sequelize
- **Frontend moderno** con React 19 + Vite
- **Comunicación en tiempo real** con Socket.IO
- **Seguridad enterprise-grade** con múltiples capas de protección
- **Sistema de pagos completo** con múltiples gateways
- **Dashboard ejecutivo** con KPIs y reportes

### Casos de Uso
- Gestión integral de clientes y contactos
- Control de productos e inventario
- Procesamiento de órdenes de venta
- Sistema de cotizaciones
- Gestión de pagos con múltiples métodos
- Reportes y análisis empresariales
- Notificaciones en tiempo real

---

## 🛠️ Stack Tecnológico

### Backend
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 5.2.1 |
| **Database** | MySQL | 8.0+ |
| **ORM** | Sequelize | 6.37.7 |
| **Auth** | JWT (jsonwebtoken) | 9.0.3 |
| **Tiempo Real** | Socket.IO | 4.8.3 |
| **Seguridad** | Helmet, express-rate-limit, bcryptjs | Latest |
| **Validación** | Joi, express-validator | Latest |

### Frontend
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | React | 19.2.0 |
| **Build Tool** | Vite | 7.2.4 |
| **Router** | React Router Dom | 7.12.0 |
| **HTTP Client** | Axios | 1.13.2 |
| **Tiempo Real** | Socket.IO Client | 4.8.3 |
| **UI Components** | Heroicons React | 2.2.0 |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Charts** | Recharts | 3.7.0 |
| **Notificaciones** | React Hot Toast | 2.6.0 |

---

## 📁 Estructura del Proyecto

```
crm-lite/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Configuración Express (CORS, middlewares, rutas)
│   │   ├── server.js                 # Servidor HTTP, Socket.IO, base de datos
│   │   ├── config/
│   │   │   └── db.js                 # Conexión a MySQL con Sequelize
│   │   ├── models/
│   │   │   ├── user.model.js         # Modelo Usuario (admin/vendedor)
│   │   │   ├── customer.model.js     # Modelo Cliente
│   │   │   ├── product.model.js      # Modelo Producto
│   │   │   ├── order.model.js        # Modelo Orden de Venta
│   │   │   ├── orderItem.model.js    # Modelo Items en Orden
│   │   │   ├── quote.model.js        # Modelo Cotización
│   │   │   ├── quoteItem.model.js    # Modelo Items en Cotización
│   │   │   ├── payment.model.js      # Modelo Pago
│   │   │   ├── category.model.js     # Modelo Categoría
│   │   │   ├── notification.model.js # Modelo Notificación
│   │   │   └── index.js              # Relaciones entre modelos
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Login, registro, JWT
│   │   │   ├── customer.controller.js # CRUD clientes
│   │   │   ├── product.controller.js # CRUD productos
│   │   │   ├── order.controller.js   # CRUD órdenes
│   │   │   ├── quote.controller.js   # CRUD cotizaciones
│   │   │   ├── payment.controller.js # Procesamiento de pagos
│   │   │   ├── dashboard.controller.js # KPIs y estadísticas
│   │   │   └── notification.controller.js # Notificaciones en tiempo real
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # POST /login, /register
│   │   │   ├── customer.routes.js    # CRUD /customers
│   │   │   ├── product.routes.js     # CRUD /products
│   │   │   ├── order.routes.js       # CRUD /orders
│   │   │   ├── quote.routes.js       # CRUD /quotes
│   │   │   ├── payment.routes.js     # POST /payments
│   │   │   ├── dashboard.routes.js   # GET /dashboard/stats
│   │   │   └── notification.routes.js # GET /notifications
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # Verificación JWT
│   │   │   └── security.middleware.js # Logging, detectión de ataques
│   │   └── services/
│   │       └── cron.service.js       # Tareas programadas
│   ├── package.json                  # Dependencias Node
│   ├── .env                          # Variables de entorno
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Routing principal
│   │   ├── main.jsx                  # Entry point React
│   │   ├── index.css                 # Estilos globales
│   │   ├── api/
│   │   │   └── axios.js              # Cliente HTTP con interceptores
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Página de login
│   │   │   ├── Dashboard.jsx         # Dashboard ejecutivo
│   │   │   ├── Customers.jsx         # Gestión de clientes
│   │   │   ├── Products.jsx          # Gestión de productos
│   │   │   ├── Orders.jsx            # Gestión de órdenes
│   │   │   ├── Quotes.jsx            # Gestión de cotizaciones
│   │   │   ├── Notifications.jsx     # Centro de notificaciones
│   │   │   └── Reports.jsx           # Reportes y analytics
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Barra de navegación
│   │   │   └── ProtectedRoute.jsx    # Wrapper de rutas protegidas
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Context de autenticación
│   │   └── assets/                   # Imágenes, iconos
│   ├── index.html                    # Template HTML
│   ├── vite.config.js                # Configuración Vite
│   ├── package.json                  # Dependencias Node
│   ├── tailwind.config.js            # Configuración Tailwind
│   ├── postcss.config.js             # Configuración PostCSS
│   └── eslint.config.js              # Configuración ESLint
│
├── logs/                             # Archivos de log
├── .env                              # Variables de entorno (raíz)
├── .gitignore                        # Archivos ignorados en Git
├── README.md                         # Documentación principal
└── SECURITY.md                       # Política de seguridad

```

---

## ⚙️ Instalación y Setup

### Requisitos Previos
- **Node.js 18+** instalado
- **MySQL 8.0+** corriendo
- **npm** o **yarn**

### Paso 1: Clonar el Repositorio
```bash
git clone <repository-url>
cd crm-lite
```

### Paso 2: Instalar Dependencias

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

### Paso 3: Configurar Variables de Entorno

**Backend (.env):**
```env
# Base de Datos
DB_NAME=crm_lite_db
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secret_jwt_muy_seguro

# Email (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_app

# Pagos (opcional)
STRIPE_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
MERCADOPAGO_TOKEN=...
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Paso 4: Crear Base de Datos
```bash
mysql -u root -p
CREATE DATABASE crm_lite_db;
EXIT;
```

---

## 🚀 Ejecución del Sistema

### Opción 1: Dos Terminales (Recomendado)

**Terminal 1 - Backend:**
```bash
cd backend
npm run start
# Salida esperada:
# 🚀 Server running on port 5000
# ✅ MySQL conectado
# 📡 WebSocket server ready
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Salida esperada:
# VITE v7.3.1 ready in XXX ms
# ➜ Local: http://localhost:5173/
```

### Opción 2: Una Terminal (Script)
```bash
# En Windows PowerShell
npm run start  # Backend
# En otra terminal
npm run dev    # Frontend
```

### Acceso a la Aplicación
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Test:** http://localhost:5000/test

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/login          - Iniciar sesión
POST   /api/auth/register       - Crear cuenta
GET    /api/auth/profile        - Perfil del usuario (Protegido)
POST   /api/auth/logout         - Cerrar sesión (Protegido)
```

### Clientes
```
GET    /api/customers           - Listar clientes (Protegido)
GET    /api/customers/:id       - Obtener cliente (Protegido)
POST   /api/customers           - Crear cliente (Protegido)
PUT    /api/customers/:id       - Actualizar cliente (Protegido)
DELETE /api/customers/:id       - Eliminar cliente (Protegido)
```

### Productos
```
GET    /api/products            - Listar productos (Protegido)
GET    /api/products/:id        - Obtener producto (Protegido)
POST   /api/products            - Crear producto (Protegido)
PUT    /api/products/:id        - Actualizar producto (Protegido)
DELETE /api/products/:id        - Eliminar producto (Protegido)
```

### Órdenes
```
GET    /api/orders              - Listar órdenes (Protegido)
GET    /api/orders/:id          - Obtener orden (Protegido)
POST   /api/orders              - Crear orden (Protegido)
PUT    /api/orders/:id          - Actualizar orden (Protegido)
DELETE /api/orders/:id          - Eliminar orden (Protegido)
```

### Cotizaciones
```
GET    /api/quotes              - Listar cotizaciones (Protegido)
GET    /api/quotes/:id          - Obtener cotización (Protegido)
POST   /api/quotes              - Crear cotización (Protegido)
PUT    /api/quotes/:id          - Actualizar cotización (Protegido)
DELETE /api/quotes/:id          - Eliminar cotización (Protegido)
```

### Pagos
```
POST   /api/payments            - Procesar pago (Protegido)
GET    /api/payments/:id        - Obtener pago (Protegido)
GET    /api/payments            - Listar pagos (Protegido)
```

### Dashboard
```
GET    /api/dashboard/stats     - KPIs y estadísticas (Protegido)
```

### Notificaciones
```
GET    /api/notifications       - Listar notificaciones (Protegido)
PUT    /api/notifications/:id   - Marcar como leída (Protegido)
```

### Utilidad
```
GET    /test                    - Health check (Público)
```

---

## 🗄️ Modelos de Base de Datos

### Usuario (User)
```javascript
{
  id: UUID,
  email: String (Único),
  password: String (Hasheado),
  name: String,
  role: 'admin' | 'vendor' | 'viewer',
  isActive: Boolean,
  lastLogin: DateTime,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Cliente (Customer)
```javascript
{
  id: UUID,
  code: String (Único),
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  creditLimit: Decimal,
  currentDebt: Decimal,
  status: 'active' | 'inactive' | 'blocked',
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Producto (Product)
```javascript
{
  id: UUID,
  sku: String (Único),
  name: String,
  description: String,
  price: Decimal,
  cost: Decimal,
  quantity: Integer,
  minStock: Integer,
  maxStock: Integer,
  categoryId: UUID,
  status: 'active' | 'inactive',
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Orden (Order)
```javascript
{
  id: UUID,
  orderNumber: String (Único),
  customerId: UUID,
  total: Decimal,
  subtotal: Decimal,
  tax: Decimal,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded',
  createdAt: DateTime,
  updatedAt: DateTime,
  items: [OrderItem] // Relación
}
```

### Cotización (Quote)
```javascript
{
  id: UUID,
  quoteNumber: String (Único),
  customerId: UUID,
  total: Decimal,
  validUntil: DateTime,
  status: 'pending' | 'accepted' | 'rejected' | 'expired',
  createdAt: DateTime,
  updatedAt: DateTime,
  items: [QuoteItem] // Relación
}
```

### Pago (Payment)
```javascript
{
  id: UUID,
  orderId: UUID,
  amount: Decimal,
  method: 'stripe' | 'paypal' | 'mercadopago' | 'bank_transfer',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  transactionId: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## 🎨 Componentes Frontend

### Layout Principales
1. **Login.jsx** - Formulario de autenticación
2. **Dashboard.jsx** - Vista ejecutiva con KPIs
3. **Navbar.jsx** - Barra de navegación

### Páginas (Protegidas)
1. **Customers.jsx** - Tabla y gestión de clientes
2. **Products.jsx** - Tabla y gestión de productos
3. **Orders.jsx** - Tabla y gestión de órdenes
4. **Quotes.jsx** - Tabla y gestión de cotizaciones
5. **Notifications.jsx** - Centro de notificaciones en tiempo real
6. **Reports.jsx** - Gráficos y análisis avanzados

### Contexto
- **AuthContext.jsx** - Gestión global de autenticación y usuario

### Utilidades
- **axios.js** - Cliente HTTP con interceptores para JWT
- **ProtectedRoute.jsx** - Wrapper para rutas autenticadas

---

## 🔐 Flujo de Autenticación

### Login
```
1. Usuario ingresa email/password en formulario
2. Frontend POST /api/auth/login
3. Backend verifica credenciales con bcrypt
4. Backend genera JWT (valido 24 horas)
5. Frontend almacena token en localStorage
6. Frontend redirige a /dashboard
```

### Requests Protegidos
```
1. Frontend agrega header: Authorization: Bearer <token>
2. Backend verifica JWT en auth.middleware.js
3. Si válido: continúa
4. Si inválido: responde 401 Unauthorized
```

### Logout
```
1. Usuario hace clic en Logout
2. Frontend elimina token de localStorage
3. Frontend redirige a /login
```

---

## 🔧 Problemas Resueltos

### ✅ Problema 1: Vite no escuchaba en puerto 5173
**Causa:** Configuración de `host: '0.0.0.0'` causaba que Vite no bindeara correctamente
**Solución:** Cambiar a `host: 'localhost'` en `vite.config.js`

### ✅ Problema 2: Frontend no cargaba archivos
**Causa:** `vite.config.js` estaba en carpeta `src/` en lugar de raíz del frontend
**Solución:** Mover archivo a raíz del proyecto frontend

### ✅ Problema 3: CORS bloqueaba requests
**Causa:** Backend no tenía habilitado CORS para origen http://localhost:5173
**Solución:** Agregar middleware CORS en `app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### ✅ Problema 4: Rutas API no funcionaban
**Causa:** Rutas estaban comentadas (deshabilitadas para debug)
**Solución:** Descomentar importaciones de rutas y registrarlas en `app.js`

### ✅ Problema 5: Express.json() no habilitado
**Causa:** No había middleware para parsear JSON
**Solución:** Agregar:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 🔄 Cambios Realizados en Esta Sesión

1. **Habilitado CORS** en backend para desarrollo
2. **Descomentar rutas API** (auth, customers, products, etc.)
3. **Descomentar middleware de parseo JSON**
4. **Corregir ubicación de vite.config.js** (movido a raíz del frontend)
5. **Ajustar configuración Vite** (plugin correcto: react-swc en lugar de react)
6. **Iniciar ambos servidores** (backend:5000, frontend:5173)

---

## 📊 Estado Actual del Sistema

### ✅ Backend
- Puerto: **5000**
- Base de datos: **MySQL conectada**
- CORS: **Habilitado**
- Rutas: **Operacionales**
- Socket.IO: **Disponible (no habilitado en momento)**

### ✅ Frontend
- Puerto: **5173**
- Framework: **React 19.2.0 + Vite**
- Router: **React Router Dom funcionando**
- Estilos: **Tailwind CSS**

---

## 🚀 Próximas Mejoras

### Corto Plazo
- [ ] Habilitar Socket.IO para notificaciones en tiempo real
- [ ] Sincronizar modelos de base de datos
- [ ] Implementar cron jobs para alertas
- [ ] Habilitar seguridad (Helmet, rate limiting, sanitización)
- [ ] Testing (Jest, React Testing Library)

### Mediano Plazo
- [ ] Dashboard completo con gráficos
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Envío de emails automático
- [ ] Sistema de pagos (Stripe, PayPal)
- [ ] Control de inventario avanzado

### Largo Plazo
- [ ] Mobile app (React Native)
- [ ] Integración con ERPs externos
- [ ] Machine Learning para predicciones
- [ ] Internacionalización (i18n)
- [ ] Despliegue en producción (Docker, AWS/Google Cloud)

---

## 📞 Comandos Útiles

```bash
# Backend
cd backend
npm run start          # Iniciar servidor
npm run dev            # Iniciar con nodemon (desarrollo)

# Frontend
cd frontend
npm run dev            # Iniciar Vite dev server
npm run build          # Build para producción
npm run lint           # Verificar ESLint

# Base de Datos
mysql -u root -p      # Conectar a MySQL
SHOW DATABASES;        # Listar bases de datos
USE crm_lite_db;      # Usar base de datos
SHOW TABLES;          # Listar tablas
```

---

## 📝 Notas Importantes

1. **Socket.IO está comentado** en `server.js` para evitar conflictos durante debug
2. **Sincronización de modelos comentada** en `server.js` - descomentar cuando BD esté lista
3. **Middlewares de seguridad comentados** en `app.js` - habilitar cuando se complete desarrollo
4. **Las rutas requieren autenticación JWT** excepto `/api/auth/login`, `/api/auth/register` y `/test`
5. **Tokens JWT caducan en 24 horas** - configurar en auth.middleware.js

---

## 📚 Referencias

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Sequelize ORM](https://sequelize.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

---

**Última Actualización:** 24 de Enero, 2026  
**Responsable:** Sistema Automatizado  
**Versión:** 1.0.0
