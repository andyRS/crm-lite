# 🏗️ Análisis Técnico del Sistema

## 1. Diagrama de Flujos de Datos

### Flujo de Autenticación
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  Login.jsx → setEmail, setPassword → onClick submit    │
└──────────────────────┬──────────────────────────────────┘
                       │ POST /api/auth/login
                       │ { email, password }
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express)                      │
│  auth.routes.js → auth.controller.js                   │
│  1. Buscar usuario por email                           │
│  2. Comparar password con bcrypt                       │
│  3. Generar JWT token                                  │
│  4. Retornar { token, user }                           │
└──────────────────────┬──────────────────────────────────┘
                       │ Response { token }
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  localStorage.setItem("token", response.data.token)    │
│  navigate("/") → redirige a Dashboard                  │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Request Autenticado
```
┌─────────────────────────────────────────────────────────┐
│          Frontend (axios.js interceptor)                │
│  Todos los requests:                                   │
│  config.headers.Authorization = "Bearer {token}"      │
└──────────────────────┬──────────────────────────────────┘
                       │ Header + Authorization
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (auth.middleware.js)               │
│  1. Extraer token del header                           │
│  2. Verificar JWT (seguridad)                          │
│  3. Si válido → next()                                 │
│  4. Si inválido → 401 Unauthorized                     │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │ Válido                  │ Inválido
          ▼                         ▼
    ┌──────────┐            ┌──────────────┐
    │ Continuar│            │ 401 Response │
    │ Ruta     │            │ Redirect /   │
    │ Protegida│            │ login        │
    └──────────┘            └──────────────┘
```

### Flujo de CRUD (Clientes, Productos, etc)
```
┌─────────────────────────────────────────────────────────┐
│         Frontend (pages/Customers.jsx)                  │
│  1. useEffect → api.get('/customers')                  │
│  2. Mostrar tabla con resultados                       │
│  3. Click en botón → abrir formulario                  │
│  4. Enviar POST/PUT/DELETE                             │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────┬───┴────┬──────────┐
        │ GET      │ POST   │ DELETE   │
        │ (List)   │(Create)│(Remove)  │
        ▼          ▼        ▼
┌─────────────────────────────────────────────────────────┐
│      Backend (routes + controllers + models)            │
│  1. Validar JWT (middleware)                           │
│  2. Validar datos (Joi/express-validator)              │
│  3. Ejecutar query Sequelize                           │
│  4. Retornar JSON                                      │
└──────────────────────┬──────────────────────────────────┘
                       │ Response JSON
                       ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend (setDatos / toast)                      │
│  1. Actualizar estado                                  │
│  2. Mostrar toast (success/error)                      │
│  3. Recargar tabla                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Mapa de Rutas API

### Auth (Público + Privado)
```
POST   /api/auth/login         → Iniciar sesión
POST   /api/auth/register      → Crear cuenta
GET    /api/auth/profile       → Mi perfil (JWT required)
POST   /api/auth/logout        → Cerrar sesión (JWT required)
GET    /test                   → Health check (sin JWT)
```

### Clientes
```
GET    /api/customers          → Listar (con paginación)
GET    /api/customers/:id      → Obtener uno
POST   /api/customers          → Crear
PUT    /api/customers/:id      → Actualizar
DELETE /api/customers/:id      → Eliminar (soft delete)
```

### Productos
```
GET    /api/products           → Listar (con filtros)
GET    /api/products/:id       → Obtener uno
POST   /api/products           → Crear
PUT    /api/products/:id       → Actualizar (stock)
DELETE /api/products/:id       → Eliminar
```

### Órdenes
```
GET    /api/orders             → Listar órdenes
GET    /api/orders/:id         → Obtener orden + items
POST   /api/orders             → Crear orden
  {
    customerId: UUID,
    items: [{ productId, quantity, price }],
    total: Decimal
  }
PUT    /api/orders/:id         → Actualizar estado
DELETE /api/orders/:id         → Cancelar orden
```

### Cotizaciones
```
GET    /api/quotes             → Listar cotizaciones
GET    /api/quotes/:id         → Obtener cotización + items
POST   /api/quotes             → Crear cotización
PUT    /api/quotes/:id         → Actualizar
DELETE /api/quotes/:id         → Eliminar
```

### Pagos
```
POST   /api/payments           → Procesar pago
  {
    orderId: UUID,
    amount: Decimal,
    method: 'stripe'|'paypal'|'mercadopago'
  }
GET    /api/payments           → Listar pagos
GET    /api/payments/:id       → Obtener pago
```

### Dashboard (KPIs)
```
GET    /api/dashboard/stats    → Estadísticas
  Response:
  {
    totalRevenue: Decimal,
    totalOrders: Integer,
    totalCustomers: Integer,
    topProducts: Array,
    salesByMonth: Array,
    pendingOrders: Integer
  }
```

### Notificaciones
```
GET    /api/notifications      → Listar notificaciones
PUT    /api/notifications/:id  → Marcar como leída
DELETE /api/notifications/:id  → Eliminar
```

---

## 3. Estructura de Base de Datos

### Relaciones Principales
```
Users
  ├── hasMany Orders
  └── hasMany Quotes

Customers
  ├── hasMany Orders
  ├── hasMany Quotes
  └── hasMany Payments

Products
  ├── belongsTo Category
  └── hasMany OrderItems
     └── belongsTo Order

Orders
  ├── belongsTo Customer
  ├── hasMany OrderItems
  └── hasMany Payments

OrderItems
  ├── belongsTo Order
  └── belongsTo Product

Quotes
  ├── belongsTo Customer
  └── hasMany QuoteItems

QuoteItems
  ├── belongsTo Quote
  └── belongsTo Product

Payments
  ├── belongsTo Order
  └── hasOne PaymentTransaction

Categories
  └── hasMany Products

Notifications
  └── belongsTo User
```

---

## 4. Capas de Seguridad

### 1. Transport Security (HTTPS en producción)
```
- En desarrollo: HTTP (localhost)
- En producción: HTTPS requerido
```

### 2. CORS (Cross-Origin)
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // solo este origen
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Helmet (Headers de seguridad)
```
Comentado - Habilitar en producción:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- HSTS (HTTP Strict Transport Security)
```

### 4. JWT (Autenticación)
```javascript
// Token genera con:
jwt.sign({ userId, email, role }, SECRET, { expiresIn: '24h' })

// Verificado en cada request:
const decoded = jwt.verify(token, SECRET)
```

### 5. bcryptjs (Contraseñas)
```javascript
// Al crear/actualizar:
const hash = await bcrypt.hash(password, 10)

// Al comparar:
const isValid = await bcrypt.compare(plainPassword, hash)
```

### 6. Rate Limiting (Comentado - habilitar)
```javascript
// 15 min window:
- Login: máx 5 intentos
- Crear recursos: máx 20
- Búsquedas: máx 50
- General: máx 100
```

### 7. Input Sanitization (Comentado - habilitar)
```javascript
// Prevenir XSS:
- Remover scripts: <script>alert('xss')</script>
- Remover HTML: <img src=x onerror=alert('xss')>
- Remover event handlers: onclick=, onload=
```

### 8. SQL Injection Protection
```
- Sequelize (ORM) previene automáticamente
- Parametrized queries
- Validación con Joi/express-validator
```

---

## 5. Flujos de Negocio

### Flujo de Orden
```
1. Customer selecciona productos
2. Sistema valida:
   - Stock disponible
   - Límite de crédito del cliente
3. Crear Order + OrderItems
4. Actualizar stock
5. Crear Notification
6. Cliente puede pagar:
   - Stripe
   - PayPal
   - MercadoPago
7. Confirmar pago
8. Cambiar estado a "Confirmed"
9. Preparar envío
10. Marcar como "Delivered"
```

### Flujo de Cotización
```
1. Customer solicita cotización
2. Vendedor crea Quote + QuoteItems
3. Quote valida hasta fecha específica
4. Cliente revisa y acepta/rechaza
5. Si acepta: convertir a Order
6. Si rechaza: marcar como rejected
7. Si expira: marcar como expired
```

### Flujo de Pago
```
1. Order pendiente de pago
2. Cliente elige método:
   - Stripe
   - PayPal
   - MercadoPago
3. Sistema valida:
   - Monto correcto
   - Información válida
4. Procesar pago:
   - Llamar gateway
   - Esperar confirmación
5. Actualizar estado:
   - COMPLETED → Deuda cliente
   - FAILED → Permitir reintento
   - REFUNDED → Revertir deuda
```

---

## 6. Estados y Transiciones

### Estados de Orden
```
pending → confirmed → shipped → delivered
   ↓                                    ↓
cancelled (en cualquier momento)  refunded
```

### Estados de Cotización
```
pending → accepted → (converti a orden)
   ↓        ↓
rejected  expired (después de fecha)
```

### Estados de Pago
```
pending → completed
   ↓        ↓
failed    refunded
   ↓
reintento
```

### Estados de Cliente
```
active ←→ inactive ← blocked
         (manual)    (deuda alta)
```

---

## 7. Caché y Performance

### Frontend
- LocalStorage: JWT token
- State: datos cargados (React)
- SessionStorage: preferencias temporales

### Backend
- Índices MySQL en: email, customerId, productId, orderId
- Paginación: 20-50 items por request
- Lazy loading: no traer todo de una vez

---

## 8. Monitoreo y Logs

### Backend Logs (comentado - habilitar)
```
security.middleware.js:
- Login attempts
- Failed authentications
- Suspicious patterns
- Rate limit violations

Controllers:
- Operaciones CRUD
- Errores de negocio
- Transacciones de pago
```

### Frontend Logs (en consola)
```
- API requests/responses
- Errores no capturados
- Cambios de estado
- Socket.IO events
```

---

## 9. Testing (Por hacer)

### Backend Tests
```
- Auth: login, register, JWT validation
- CRUD: create, read, update, delete
- Validations: datos inválidos
- Business logic: límites de crédito, stock
- Security: CORS, rate limiting
```

### Frontend Tests
```
- Login form: submit, validation
- Protected routes: redirige a login
- API calls: mock axios
- Components: render, interactions
```

---

## 10. Deployment Checklist

- [ ] `.env` con valores de producción
- [ ] HTTPS habilitado
- [ ] CORS restringido a dominio real
- [ ] Helmet habilitado
- [ ] Rate limiting activo
- [ ] Sanitización activa
- [ ] Logs configurados
- [ ] Backups MySQL programados
- [ ] Monitoreo de errores (Sentry)
- [ ] CDN para assets estáticos
- [ ] Docker setup
- [ ] CI/CD pipeline

---

**Última Actualización:** 24 de Enero, 2026
