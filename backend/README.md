# 🚀 CRM Lite ERP - Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.37.7-blue.svg)](https://sequelize.org/)

## 👨‍💻 Desarrollador
**Andy Rosado** - Ingeniero de Sistemas | Desarrollador Web Full Stack

**Última Actualización:** Enero 2026

---

## 📋 Descripción

Backend del sistema CRM Lite ERP desarrollado con Node.js y Express. Proporciona una API RESTful completa para gestión empresarial con:

- 🔐 Autenticación JWT con refresh tokens
- 🔔 Notificaciones en tiempo real vía Socket.IO
- 💰 Sistema de facturación multimoneda (DOP/USD)
- 📊 Reportes avanzados con gráficos
- 🛡️ Seguridad robusta con rate limiting y validación
- 📈 Sistema de logging estructurado
- ⚡ Caché en memoria y paginación automática

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── config/          # Configuración de DB y constantes
│   ├── controllers/     # Lógica de negocio
│   ├── middlewares/     # Auth, validación, errores, seguridad
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Definición de endpoints
│   ├── utils/           # Utilidades (logging, caché, paginación)
│   ├── validators/      # Esquemas de validación Joi
│   ├── app.js          # Configuración de Express
│   ├── server.js       # Punto de entrada
│   └── seed.js         # Datos iniciales
├── logs/               # Logs del sistema
└── .env               # Variables de entorno
```

## ✨ Características Principales

### 🔐 Seguridad Implementada
- **Autenticación JWT** con access y refresh tokens
- **Bcrypt** para hash de contraseñas (10 salt rounds)
- **Helmet** para headers HTTP seguros
- **Rate Limiting**: 100 requests / 15 minutos
- **CORS** configurado para orígenes específicos
- **Sanitización XSS** en todos los inputs
- **Validación Joi** exhaustiva en endpoints
- **SQL Injection Protection** vía Sequelize ORM
- **RBAC** (Role-Based Access Control)
- **Logging de seguridad** para ataques detectados

### 🛡️ Robustez del Sistema
- **Manejo global de errores** con middleware centralizado
- **Sistema de logging** estructurado (4 niveles: ERROR, WARN, INFO, DEBUG)
- **Transacciones DB** para operaciones críticas
- **Validación de entorno** al iniciar servidor
- **CatchAsync wrapper** para controladores asíncronos
- **Error boundaries** y mensajes de error claros
- **Health checks** y monitoring endpoints

### ⚡ Escalabilidad y Performance
- **Pool de conexiones MySQL**: max 10, timeout 60s
- **Caché en memoria** con TTL configurable
- **Paginación automática** en todos los listados
- **Lazy loading** de relaciones Sequelize
- **Índices optimizados** en base de datos
- **Query optimization** con includes opcionales
- **Modelos normalizados** con relaciones bien definidas

### 🔔 Tiempo Real
- **Socket.IO** para notificaciones instantáneas
- **27 tipos de notificaciones** implementadas
- **Eventos en tiempo real** (órdenes, pagos, alertas)
- **Broadcast selectivo** por usuario y rol
- **Reconexión automática** del cliente

### 💰 Facturación Avanzada
- **Multimoneda**: DOP (RD$) y USD ($)
- **ITBIS 18%** automático
- **Múltiples estados**: pending, paid, overdue, cancelled
- **Integración Stripe** para pagos online
- **Modo simulación** para países sin Stripe
- **Múltiples métodos de pago**: efectivo, tarjeta, transferencia, cheque

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/register          - Registro de usuarios
POST   /api/auth/login             - Inicio de sesión
GET    /api/auth/profile           - Perfil del usuario
POST   /api/auth/refresh           - Renovar token
```

### Clientes
```
GET    /api/customers              - Listar clientes (paginado)
POST   /api/customers              - Crear cliente
GET    /api/customers/:id          - Obtener cliente
PUT    /api/customers/:id          - Actualizar cliente
DELETE /api/customers/:id          - Eliminar cliente
```

### Productos
```
GET    /api/products               - Listar productos (paginado)
POST   /api/products               - Crear producto
GET    /api/products/:id           - Obtener producto
PUT    /api/products/:id           - Actualizar producto
DELETE /api/products/:id           - Eliminar producto
```

### Cotizaciones
```
GET    /api/quotes                 - Listar cotizaciones
POST   /api/quotes                 - Crear cotización
GET    /api/quotes/:id             - Obtener cotización
PUT    /api/quotes/:id             - Actualizar cotización
DELETE /api/quotes/:id             - Eliminar cotización
POST   /api/quotes/:id/convert     - Convertir a orden
GET    /api/quotes/company/info    - Info de empresa
```

### Órdenes
```
GET    /api/orders                 - Listar órdenes
POST   /api/orders                 - Crear orden
GET    /api/orders/:id             - Obtener orden
PUT    /api/orders/:id             - Actualizar orden
DELETE /api/orders/:id             - Eliminar orden
```

### Facturas
```
GET    /api/invoices               - Listar facturas
POST   /api/invoices               - Crear factura
GET    /api/invoices/:id           - Obtener factura
PUT    /api/invoices/:id           - Actualizar factura
DELETE /api/invoices/:id           - Eliminar factura
GET    /api/invoices/stats         - Estadísticas
```

### Pagos
```
GET    /api/payments               - Listar pagos
POST   /api/payments               - Registrar pago
GET    /api/payments/:id           - Obtener pago
```

### Stripe
```
POST   /api/stripe/create-payment-intent    - Crear intención de pago
GET    /api/stripe/publishable-key          - Obtener clave pública
POST   /api/stripe/webhook                  - Webhook de Stripe
```

### Dashboard
```
GET    /api/dashboard/stats        - Métricas generales
GET    /api/dashboard/recent       - Actividad reciente
```

### Notificaciones
```
GET    /api/notifications          - Listar notificaciones
PUT    /api/notifications/:id/read - Marcar como leída
GET    /api/notifications/unread-count - Contador de no leídas
```

## 🔧 Instalación

### Requisitos Previos
- Node.js v18+ 
- MySQL 8.0+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd crm-lite/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=crm_lite_db
DB_PORT=3306

# JWT
JWT_SECRET=tu_secret_key_muy_segura_y_larga
JWT_REFRESH_SECRET=otro_secret_diferente

# Puerto
PORT=5000
NODE_ENV=development

# Stripe (Opcional)
PAYMENT_SIMULATION_MODE=true
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. **Crear base de datos**
```bash
mysql -u root -p
CREATE DATABASE crm_lite_db;
```

5. **Ejecutar migraciones y seeds**
```bash
node src/seed.js
```

6. **Iniciar servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 🗄️ Modelos de Base de Datos

### Usuario (User)
- id, name, email, password (hash), role (admin/manager/user)
- timestamps (createdAt, updatedAt)

### Cliente (Customer)
- id, name, email, phone, address, creditLimit
- Relaciones: User, Orders, Quotes, Invoices

### Producto (Product)
- id, name, sku, description, price, stock, category_id
- Relaciones: Category, OrderItems, InvoiceItems, QuoteItems

### Cotización (Quote)
- id, quoteNumber, customerId, userId, status, total, validUntil
- **currency (DOP/USD)**, discount, notes
- clientName, clientEmail, clientPhone, clientCompany (para no registrados)
- Relaciones: User, Customer, QuoteItems

### Orden (Order)
- id, orderNumber, customer_id, status, total, orderDate, deliveryDate
- paymentStatus, taxAmount, discountAmount
- Relaciones: Customer, OrderItems

### Factura (Invoice)
- id, invoiceNumber, customer_id, invoiceDate, dueDate
- subtotal, taxRate, taxAmount, discountAmount, total
- status (draft/pending/paid/overdue/cancelled)
- **currency (DOP/USD)**, paymentMethod, notes, paidAt
- Relaciones: Customer, InvoiceItems

### Pago (Payment)
- id, invoice_id, amount, paymentMethod, transactionId
- status, paymentDate
- Relaciones: Invoice, PaymentTransactions

### Notificación (Notification)
- id, userId, type, title, message, isRead
- Relaciones: User

## 📦 Dependencias Principales

```json
{
  "express": "^5.2.1",
  "sequelize": "^6.37.5",
  "mysql2": "^3.11.5",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "joi": "^17.13.3",
  "helmet": "^8.0.0",
  "express-rate-limit": "^7.4.1",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "socket.io": "^4.8.1",
  "stripe": "^17.5.0"
}
```

## 🔐 Sistema de Autenticación

### JWT
- Access token: 24h de duración
- Refresh token: 7 días de duración
- Almacenados en httpOnly cookies (producción)
- Protección contra CSRF

### Roles y Permisos
- **admin**: Acceso completo al sistema
- **manager**: Gestión de clientes, productos, cotizaciones, órdenes
- **user**: Solo lectura y creación de cotizaciones

## 💳 Sistema de Pagos

### Modo Simulación
- Activo por defecto para desarrollo
- No requiere claves reales de Stripe
- Genera IDs de transacción simulados
- Útil para países sin Stripe (República Dominicana)

### Stripe Real
- Integración completa con Stripe API
- Webhooks para confirmación de pagos
- Cálculo automático de comisiones (2.9% + $0.30)
- Soporte para múltiples monedas

## 📊 Sistema de Logging

Los logs se almacenan en `logs/`:
- `error.log`: Solo errores
- `combined.log`: Todos los niveles
- `app.log`: Log de aplicación

Niveles de log:
- ERROR: Errores críticos
- WARN: Advertencias
- INFO: Información general
- DEBUG: Información de depuración

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🚀 Despliegue

### Producción
1. Configurar variables de entorno de producción
2. Usar `NODE_ENV=production`
3. Configurar SSL/TLS
4. Usar PM2 para gestión de procesos
5. Configurar nginx como reverse proxy
6. Habilitar HTTPS

```bash
# Con PM2
pm2 start src/server.js --name crm-backend
pm2 startup
pm2 save
```

## 📝 Notas de Desarrollo

### Convenciones de Código
- Usar async/await en lugar de callbacks
- Wrap async functions con catchAsync
- Validar inputs con Joi antes de procesar
- Usar transacciones para operaciones múltiples
- Incluir timestamps en logs
- Documentar funciones complejas

### Mejores Prácticas
- No exponer errores internos al cliente
- Sanitizar todos los inputs
- Usar prepared statements (automático con Sequelize)
- Implementar rate limiting en endpoints públicos
- Validar tokens en cada request protegido

## 🐛 Debugging

```bash
# Modo debug con logs detallados
DEBUG=* npm run dev

# Ver logs en tiempo real
tail -f logs/combined.log
```

## 📞 Soporte

**Desarrollado por:** Andy Rosado  
**Email:** [tu-email]  
**GitHub:** [tu-github]

---

© 2026 CRM Lite ERP Backend. Desarrollado por Andy Rosado.# Build 2026-01-25 10:10:59
# 2026-01-25 10:30:09
