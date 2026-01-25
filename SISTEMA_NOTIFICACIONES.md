# 🔔 Sistema de Notificaciones - CRM Lite

## Descripción General

El CRM Lite cuenta con un sistema de notificaciones completo que alerta a los usuarios sobre eventos importantes en tiempo real. Las notificaciones se entregan tanto por **Socket.IO** (tiempo real) como por **polling** (respaldo cada 30 segundos).

---

## 🎯 Características Principales

### ✅ Notificaciones en Tiempo Real
- **Socket.IO**: Comunicación bidireccional instantánea
- **Salas Personalizadas**: Cada usuario recibe solo sus notificaciones
- **Toast Notifications**: Alertas visuales con colores según tipo
- **Respaldo por Polling**: Sistema de respaldo si Socket.IO falla

### 🎨 Tipos de Notificaciones
| Tipo | Color | Icono | Uso |
|------|-------|-------|-----|
| `success` | Verde | ✅ | Operaciones exitosas |
| `info` | Azul | ℹ️ | Información general |
| `warning` | Amarillo | ⚠️ | Alertas importantes |
| `error` | Rojo | ❌ | Errores o rechazos |

---

## 📋 Eventos que Generan Notificaciones

### 🛒 **PEDIDOS (Orders)**

#### Creación de Pedido
- ✅ **Notificación al creador**: "Pedido Creado"
  - Muestra número de pedido y cliente
  - Tipo: `success`

- 🔥 **Alerta a Managers** (si cumple condiciones):
  - Prioridad = `high` O Total > $1000
  - Título: "Nuevo Pedido Importante"
  - Incluye número, cliente y total

- ⚠️ **Alerta de Stock Bajo**:
  - Si después del pedido: `stock <= minStock`
  - Notifica a managers sobre productos con bajo inventario
  - Tipo: `warning`

- ⚠️ **Alerta de Crédito** (si cliente tiene límite):
  - Si uso de crédito ≥ 80%
  - Notifica a managers: "Cliente Cerca del Límite de Crédito"
  - Muestra porcentaje usado y montos

#### Cambio de Estado
- **Notificación al usuario asignado**:
  - ⏳ Pendiente → "Pedido Pendiente"
  - ✅ Confirmado → "Pedido Confirmado"
  - 📦 En proceso → "Pedido en Proceso"
  - 🚚 Enviado → "Pedido Enviado"
  - ✨ Entregado → "Pedido Entregado"
  - ❌ Cancelado → "Pedido Cancelado"

- 🎉 **Celebración de Venta** (cuando estado = `delivered`):
  - Título: "Venta Completada"
  - Notifica a managers sobre venta exitosa

---

### 💼 **COTIZACIONES (Quotes)**

#### Creación de Cotización
- ✅ **Notificación al creador**: "Cotización Creada"
  - Muestra número, cliente y total
  - Tipo: `success`

- 💰 **Alerta a Managers** (si total > $5000):
  - Título: "Cotización de Alto Valor"
  - Tipo: `info`

- ⏰ **Alerta de Vencimiento Próximo**:
  - Si vence en ≤ 3 días
  - Título: "Cotización Por Vencer"
  - Tipo: `warning`

#### Cambio de Estado
- **Notificaciones por estado**:
  - ⏳ Pendiente → "Cotización Pendiente"
  - ✅ Aprobada → "Cotización Aprobada" + alerta a managers
  - ❌ Rechazada → "Cotización Rechazada"
  - ⏰ Vencida → "Cotización Vencida"

#### Conversión a Pedido
- 🎉 **Al usuario**: "Cotización Convertida a Pedido"
  - Muestra números de cotización y pedido + total
  
- ✅ **A Managers**: "Cotización Convertida"
  - Confirma conversión exitosa

---

### 📄 **FACTURAS (Invoices)**

#### Creación de Factura
- 📄 **Notificación al creador**: "Factura Generada"
  - Muestra número de factura y total
  - Tipo: `success`

- 💰 **Alerta a Managers** (si total > $10,000):
  - Título: "Factura de Alto Valor"
  - Tipo: `info`

- ⚠️ **Alerta de Vencimiento Próximo**:
  - Si vence en ≤ 7 días
  - Título: "Factura Próxima a Vencer"
  - Tipo: `warning`

#### Cambio de Estado
- **Notificaciones por estado**:
  - ⏳ Pendiente → "Factura Pendiente"
  - ✅ Pagada → "Factura Pagada" + notifica a managers
  - ⚠️ Vencida → "Factura Vencida" + alerta a managers
  - ❌ Cancelada → "Factura Cancelada"

#### Pago Recibido
- 💰 **A Managers**: "Pago Recibido"
  - Confirma pago de factura con monto
  - Tipo: `success`

---

### 👤 **CLIENTES (Customers)**

#### Nuevo Cliente
- 👤 **Notificación al creador**: "Nuevo Cliente Registrado"
  - Muestra nombre y código del cliente
  - Tipo: `success`

- 💳 **Alerta a Managers** (si creditLimit > $50,000):
  - Título: "Cliente con Alto Límite de Crédito"
  - Tipo: `info`

#### Actualización de Cliente

##### Cambio de Límite de Crédito
- 💳 **Al usuario**: "Límite de Crédito Actualizado"
  - Muestra nuevo límite
  
- ⚠️ **A Managers** (si nuevo límite > $100,000):
  - Título: "Límite de Crédito Alto"
  - Tipo: `warning`

##### Cambio de Estado
- 🔴 **Cliente Desactivado**:
  - Cuando cambia de `active` a `inactive`
  - Tipo: `warning`

- 🟢 **Cliente Reactivado**:
  - Cuando cambia de `inactive` a `active`
  - Tipo: `success`

---

## 🔧 Arquitectura Técnica

### Backend

#### 1. Helper Functions (notification.controller.js)

```javascript
// Crear notificación individual
await createNotification(
  userId,           // ID del usuario receptor
  title,            // Título con emoji
  message,          // Descripción detallada
  type,             // success | info | warning | error
  relatedId,        // ID del registro relacionado
  relatedType       // order | quote | invoice | customer
);

// Notificar a múltiples usuarios
await notifyUsers([userId1, userId2], title, message, type, relatedId, relatedType);

// Notificar a todos los managers y admins
await notifyManagers(title, message, type, relatedId, relatedType);

// Notificar solo a admins
await notifyAdmins(title, message, type, relatedId, relatedType);
```

#### 2. Socket.IO (server.js)

```javascript
// Configuración
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Conexiones
io.on('connection', (socket) => {
  // Usuario se une a su sala personal
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
});

// Emisión global disponible
global.io = io;
```

#### 3. Emisión de Eventos

```javascript
// En createNotification()
if (global.io) {
  global.io.to(`user_${userId}`).emit('notification', {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    relatedId: notification.relatedId,
    relatedType: notification.relatedType,
    createdAt: notification.createdAt
  });
}
```

### Frontend

#### 1. Conexión Socket.IO (Dashboard.jsx)

```javascript
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

socket.on('connect', () => {
  socket.emit('join', user.id); // Unirse a sala personal
});

socket.on('notification', (notification) => {
  // Mostrar toast según tipo
  if (notification.type === 'success') {
    toast.success(`${notification.title}: ${notification.message}`);
  } else if (notification.type === 'warning') {
    toast(`${notification.title}: ${notification.message}`, { icon: '⚠️' });
  } else if (notification.type === 'error') {
    toast.error(`${notification.title}: ${notification.message}`);
  } else {
    toast(`${notification.title}: ${notification.message}`, { icon: 'ℹ️' });
  }
  
  loadRecentNotifications(); // Actualizar lista
});
```

#### 2. Sistema de Respaldo (Polling)

```javascript
// Cada 30 segundos como respaldo
const notificationInterval = setInterval(() => {
  loadRecentNotifications();
}, 30000);
```

---

## 🎯 Reglas de Notificación por Rol

### 👤 **User**
- Recibe notificaciones de sus propias acciones
- Ve notificaciones de registros que creó o tiene asignados

### 👔 **Manager**
- Recibe todas las notificaciones de usuarios
- Recibe alertas especiales:
  - Pedidos importantes (prioridad alta o alto valor)
  - Stock bajo
  - Cotizaciones de alto valor
  - Facturas de alto valor
  - Clientes con alto límite de crédito
  - Clientes cerca del límite de crédito
  - Ventas completadas
  - Pagos recibidos
  - Facturas vencidas

### 👑 **Admin**
- Recibe todas las notificaciones de managers
- Recibe alertas administrativas adicionales

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Usuario crea un pedido normal
```
✅ Usuario recibe: "Pedido Creado - Pedido ORD-123 creado para Cliente ABC"
```

### Ejemplo 2: Usuario crea pedido de prioridad alta
```
✅ Usuario recibe: "Pedido Creado - Pedido ORD-124 creado para Cliente XYZ"
🔥 Managers reciben: "Nuevo Pedido Importante - Pedido ORD-124 para Cliente XYZ por $2,500.00"
```

### Ejemplo 3: Pedido reduce stock por debajo del mínimo
```
⚠️ Managers reciben: "Stock Bajo - Producto 'Laptop Dell' tiene stock bajo (5 unidades)"
```

### Ejemplo 4: Cliente usa 85% de su crédito
```
⚠️ Managers reciben: "Cliente Cerca del Límite de Crédito - Cliente ABC está usando 85% de su límite ($42,500 de $50,000)"
```

### Ejemplo 5: Cotización se convierte en pedido
```
🎉 Usuario recibe: "Cotización Convertida a Pedido - Cotización QT-100 convertida a ORD-125 por $8,000.00"
✅ Managers reciben: "Cotización Convertida - Cotización QT-100 se ha convertido en ORD-125 por $8,000.00"
```

### Ejemplo 6: Se recibe pago de factura
```
✅ Usuario recibe: "Factura Pagada - La factura INV-2024-0050 ha sido marcada como Pagada"
💰 Managers reciben: "Pago Recibido - La factura INV-2024-0050 por $15,000.00 ha sido pagada"
```

---

## 🔍 Testing

### Probar Notificaciones

1. **Crear Pedido Normal**:
   - Usuario debe ver notificación de éxito
   - Managers NO reciben alerta (si no cumple condiciones)

2. **Crear Pedido Importante**:
   - Establecer prioridad = "high" O total > $1000
   - Verificar que managers reciban alerta

3. **Stock Bajo**:
   - Crear pedido que reduzca stock ≤ minStock
   - Verificar alerta a managers

4. **Cotización de Alto Valor**:
   - Crear cotización > $5000
   - Verificar alerta a managers

5. **Factura Por Vencer**:
   - Crear factura con dueDate en 5 días
   - Verificar alerta de vencimiento

6. **Cliente con Alto Crédito**:
   - Crear cliente con creditLimit > $50,000
   - Verificar alerta a managers

7. **Tiempo Real**:
   - Abrir dashboard en dos navegadores con usuarios diferentes
   - Crear pedido con user1
   - Verificar que user2 (si es manager) reciba notificación instantánea

---

## 🚀 Mejoras Futuras

### Corto Plazo
- [ ] Centro de notificaciones con historial completo
- [ ] Marcar notificaciones como leídas
- [ ] Filtros por tipo de notificación
- [ ] Preferencias de notificación por usuario

### Mediano Plazo
- [ ] Notificaciones por email (opcional)
- [ ] Notificaciones push en móvil
- [ ] Agrupación de notificaciones similares
- [ ] Resumen diario de notificaciones

### Largo Plazo
- [ ] Notificaciones programadas
- [ ] Recordatorios personalizables
- [ ] IA para priorizar notificaciones importantes
- [ ] Integración con Slack/Teams

---

## 📝 Notas Técnicas

### Base de Datos
```sql
CREATE TABLE Notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('success', 'info', 'warning', 'error') DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  related_id INT NULL,
  related_type VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
```

### Dependencias
- **Backend**: `socket.io` ^4.x
- **Frontend**: `socket.io-client` ^4.x, `react-hot-toast` ^2.x

### Performance
- Socket.IO mantiene conexiones persistentes
- Polling solo como respaldo (reduce carga)
- Notificaciones limitadas a 5 más recientes en dashboard
- Histórico completo disponible en API `/notifications`

---

## 🆘 Troubleshooting

### Socket.IO no conecta
1. Verificar que server.js tenga Socket.IO activo
2. Revisar CORS en configuración de Socket.IO
3. Comprobar que puerto 3000 esté abierto
4. Verificar en consola del navegador: debe mostrar "🔌 Conectado a Socket.IO"

### Notificaciones no aparecen
1. Verificar que usuario esté autenticado
2. Comprobar que `global.io` esté definido en backend
3. Revisar que usuario se haya unido a su sala (`join` event)
4. Verificar permisos (users no reciben alertas de managers)

### Notificaciones duplicadas
1. Asegurar que Socket.IO se desconecte en cleanup
2. Verificar que polling no esté ejecutándose demasiado rápido
3. Comprobar que no haya múltiples listeners del mismo evento

---

## 📞 Contacto

Para dudas o sugerencias sobre el sistema de notificaciones, contacta al equipo de desarrollo.

**Versión**: 2.1.0  
**Última actualización**: 2024
