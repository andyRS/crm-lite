# CRM Lite ERP - Sistema de Gestión Empresarial

## �‍💻 Desarrollador

**Andy Rosado**  
Ingeniero de Sistemas | Desarrollador Web Full Stack  
República Dominicana

---

## 📋 Descripción

CRM Lite ERP es un sistema completo de gestión empresarial (ERP/CRM) desarrollado con tecnologías modernas. Incluye gestión de clientes, productos, cotizaciones, órdenes, facturas con soporte de múltiples monedas, pagos y reportes en tiempo real.

## ✨ Características Principales

### Módulos Implementados
- ✅ **Autenticación y Autorización**: JWT con roles (admin, manager, user)
- ✅ **Gestión de Clientes**: CRUD completo con límites de crédito
- ✅ **Catálogo de Productos**: Gestión de inventario y categorías
- ✅ **Cotizaciones Profesionales**: 
  - Sistema con formato de documento profesional (A4/Carta)
  - Vista modal centrada para impresión
  - Soporte de clientes registrados y nuevos
  - Exportación a PDF
  - **Soporte multi-moneda (RD$ / US$)**
- ✅ **Órdenes**: Gestión completa con tracking y estados
- ✅ **Facturación Avanzada**:
  - Plantilla profesional de impresión A4/Carta
  - Gestión de estados (pendiente, pagada, vencida)
  - **Soporte multi-moneda (DOP/USD)**
  - Edición y eliminación de facturas pendientes
  - Vista dedicada para reimpresión de facturas pagadas
- ✅ **Pagos**: 
  - Múltiples métodos de pago (efectivo, tarjeta, transferencia)
  - Integración con Stripe
  - **Modo de simulación para países sin Stripe**
  - Gestión de transacciones
- ✅ **Dashboard**: Métricas y reportes en tiempo real con gráficos
- ✅ **Notificaciones**: Sistema de alertas en tiempo real con Socket.IO

### Características Destacadas 2.0

#### 💰 Sistema Multi-Moneda
- Soporte completo para **Pesos Dominicanos (RD$)** y **Dólares Americanos (US$)**
- Selector de moneda en formularios de cotización y facturación
- Conversión automática de símbolos en documentos impresos
- Persistencia de moneda en base de datos

#### 🖨️ Documentos Profesionales
- Cotizaciones con formato tipo factura optimizado para A4/Carta
- Vista de impresión con diseño profesional
- Tabla de productos detallada con cantidades, precios y descuentos
- Totales calculados automáticamente con impuestos
- Términos y condiciones incluidos
- Footer con información de empresa

#### 🌎 Adaptación Regional
- Modo de simulación de pagos para República Dominicana
- Configuración de ITBIS (18%) por defecto
- Soporte para métodos de pago locales

### Mejoras de Robustez Implementadas
- 🛡️ **Manejo Global de Errores**: ErrorBoundary en frontend y middleware en backend
- 📊 **Sistema de Logging**: Logs estructurados con niveles (ERROR, WARN, INFO, DEBUG)
- ✅ **Validación de Entorno**: Verifica variables requeridas al iniciar
- 🔒 **Seguridad Mejorada**: Rate limiting, helmet, sanitización de inputs, CORS configurado
- 🎯 **Validación Joi**: Esquemas de validación robustos para todos los endpoints
- 💾 **Gestión de Transacciones**: Todas las operaciones críticas usan transacciones
- 🔐 **Protección de Rutas**: Middleware de autenticación y autorización por roles

### Mejoras de Escalabilidad Implementadas
- 🚀 **Pool de Conexiones**: Configuración optimizada para MySQL (max: 10, timeout: 60s)
- 📄 **Sistema de Paginación**: Utilidad reutilizable para todos los endpoints
- 💨 **Caché en Memoria**: Sistema de caché con TTL para datos frecuentes
- 📈 **Optimización de Queries**: Includes con `required: false` para joins opcionales
- 🔄 **Manejo de Errores Asíncrono**: Wrapper `catchAsync` para controladores
- 📦 **Modelos Normalizados**: Relaciones bien definidas entre entidades
- ⚡ **Lazy Loading**: Carga eficiente de componentes en frontend

## 🚀 Instalación Rápida

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
node src/seed.js
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

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
