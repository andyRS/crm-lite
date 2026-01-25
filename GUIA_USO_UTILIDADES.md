# 📘 GUÍA DE USO - NUEVAS UTILIDADES CRM LITE ERP

## 🎯 Índice
1. [Sistema de Logging](#sistema-de-logging)
2. [Sistema de Caché](#sistema-de-caché)
3. [Sistema de Paginación](#sistema-de-paginación)
4. [Manejo de Errores](#manejo-de-errores)
5. [Componentes Frontend](#componentes-frontend)
6. [Mejores Prácticas](#mejores-prácticas)

---

## 📊 Sistema de Logging

### Uso Básico

```javascript
const logger = require('../utils/logger');

// Niveles de log
logger.info('Usuario creado exitosamente', { userId: 123 });
logger.error('Error al conectar a DB', { error: err.message });
logger.warn('Memoria casi al límite', { usage: '85%' });
logger.debug('Query ejecutado', { query: 'SELECT * FROM users', time: '45ms' });
```

### Métodos Específicos de Negocio

```javascript
// Logs de órdenes
logger.orderCreated('ORD-123', 1, 1500.50);
// Output: ℹ️ Orden creada: ORD-123 { userId: 1, total: 1500.5 }

// Logs de clientes
logger.customerCreated('CUST-456', 2);
// Output: ℹ️ Cliente creado: CUST-456 { userId: 2 }

// Logs de autenticación
logger.loginAttempt('user@example.com', true);
logger.loginAttempt('hacker@evil.com', false, 'Invalid credentials');
// Output: ℹ️ Login attempt: user@example.com { success: true/false, reason: '...' }

// Logs de API
logger.apiRequest('GET', '/api/products', 1, 200, '125ms');
// Output: 🔍 API Request: GET /api/products { userId: 1, statusCode: 200, duration: '125ms' }
```

### Configuración de Archivo

En tu `.env`:
```env
LOG_TO_FILE=true          # Habilitar logs a archivo
LOG_LEVEL=DEBUG           # Nivel: ERROR | WARN | INFO | DEBUG
```

Logs se guardan en: `backend/logs/app-2026-01-25.log`

---

## 💨 Sistema de Caché

### Uso Manual en Controladores

```javascript
const { cache } = require('../utils/cache');

exports.getProducts = async (req, res) => {
  // Intentar obtener del caché
  const cacheKey = 'products:all';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('✅ Datos del caché');
    return res.json(cached);
  }
  
  // Si no existe, obtener de DB
  const products = await Product.findAll();
  
  // Guardar en caché (TTL: 5 minutos)
  cache.set(cacheKey, products, 300);
  
  res.json(products);
};
```

### Uso como Middleware

```javascript
const { cacheMiddleware } = require('../utils/cache');

// En tus rutas
router.get('/products', 
  authMiddleware,
  cacheMiddleware('products', 300), // Cache por 5 minutos
  productController.getAll
);

router.get('/customers/:id', 
  authMiddleware,
  cacheMiddleware('customer', 600), // Cache por 10 minutos
  customerController.getById
);
```

### Invalidación de Caché

```javascript
const { cache } = require('../utils/cache');

// Después de crear/actualizar producto
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  
  // Invalidar caché relacionado
  cache.invalidatePattern('products:'); // Invalida todo lo que empiece con "products:"
  
  res.json(product);
};

// Después de eliminar
exports.deleteProduct = async (req, res) => {
  await Product.destroy({ where: { id: req.params.id } });
  
  cache.delete(`products:${req.params.id}`); // Específico
  cache.invalidatePattern('products:'); // O todo el patrón
  
  res.json({ msg: 'Eliminado' });
};

// Limpiar todo el caché
cache.clear();
```

### Obtener Estadísticas

```javascript
const stats = cache.getStats();
console.log(stats);
// {
//   size: 15,
//   keys: ['products:all', 'customers:1', 'orders:recent', ...]
// }
```

---

## 📄 Sistema de Paginación

### Uso en Controladores

```javascript
const { formatPaginatedResponse } = require('../utils/pagination');

exports.getAll = async (req, res) => {
  try {
    // req.pagination está disponible automáticamente
    // { limit: 10, offset: 0, page: 1 }
    
    const { count, rows } = await Product.findAndCountAll({
      ...req.pagination, // Spread limit y offset
      order: [['createdAt', 'DESC']]
    });
    
    // Formatear respuesta con metadata
    const response = formatPaginatedResponse(rows, count, req.pagination);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ msg: 'Error' });
  }
};
```

### Ejemplo de Respuesta

```json
{
  "data": [
    { "id": 1, "name": "Producto 1" },
    { "id": 2, "name": "Producto 2" }
  ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

### Requests del Cliente

```javascript
// Frontend
const fetchProducts = async (page = 1, limit = 20) => {
  const res = await api.get(`/products?page=${page}&limit=${limit}`);
  return res.data;
};

// Usar en componente
const { data, pagination } = await fetchProducts(2, 20);
```

---

## 🛡️ Manejo de Errores

### Backend - Lanzar Errores Personalizados

```javascript
const { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError,
  ForbiddenError 
} = require('../middlewares/errorHandler.middleware');

// En controladores
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      throw new NotFoundError('Producto'); // 404
    }
    
    res.json(product);
  } catch (error) {
    next(error); // Pasar al error handler global
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    if (!req.body.name) {
      throw new ValidationError('El nombre es requerido'); // 400
    }
    
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Solo admins pueden crear productos'); // 403
    }
    
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};
```

### Backend - Usar catchAsync Wrapper

```javascript
const { catchAsync } = require('../middlewares/errorHandler.middleware');

// Envolver funciones async - captura errores automáticamente
exports.getAll = catchAsync(async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
  // No necesitas try/catch, catchAsync lo maneja
});

exports.create = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});
```

### Frontend - ErrorBoundary

Ya está integrado en `main.jsx`. Captura automáticamente errores de React.

Para testear:
```jsx
// Componente que lanza error intencionalmente
const BrokenComponent = () => {
  throw new Error('Oops! Error de prueba');
  return <div>Nunca se renderiza</div>;
};

// ErrorBoundary lo capturará y mostrará UI amigable
```

---

## 🎨 Componentes Frontend

### LoadingSpinner

```jsx
import LoadingSpinner, { FullPageLoader, TableLoader } from '../components/LoadingSpinner';

// Spinner básico
{loading && <LoadingSpinner size="md" text="Cargando productos..." />}

// Loader de página completa
{loading && <FullPageLoader text="Cargando aplicación..." />}

// En tablas
<tbody>
  {loading ? (
    <TableLoader />
  ) : (
    data.map(item => <tr key={item.id}>...</tr>)
  )}
</tbody>
```

**Sizes disponibles:** `sm`, `md`, `lg`

---

### EmptyState

```jsx
import EmptyState from '../components/EmptyState';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

// Con acción
<EmptyState
  icon={ShoppingCartIcon}
  title="No hay productos"
  description="Comienza agregando tu primer producto al catálogo"
  actionLabel="Agregar Producto"
  onAction={() => setShowModal(true)}
/>

// Sin acción
<EmptyState
  title="Sin resultados"
  description="No se encontraron resultados para tu búsqueda"
/>
```

---

### Notification (Hook)

```jsx
import { useNotification } from '../components/Notification';

const MyComponent = () => {
  const notify = useNotification();
  
  const handleSave = async () => {
    try {
      await api.post('/products', data);
      notify.success('Producto creado exitosamente');
    } catch (error) {
      notify.error('Error al crear producto');
    }
  };
  
  return <button onClick={handleSave}>Guardar</button>;
};
```

---

## ✅ Mejores Prácticas

### 1. Logging

```javascript
// ✅ BIEN - Información estructurada
logger.info('Orden procesada', { 
  orderId: order.id, 
  userId: user.id,
  total: order.total 
});

// ❌ MAL - Solo mensaje
console.log('Orden procesada');
```

### 2. Caché

```javascript
// ✅ BIEN - TTL apropiado según frecuencia de cambio
cache.set('products:all', products, 300);      // 5 min (cambia frecuentemente)
cache.set('categories', categories, 3600);     // 1 hora (cambia raramente)
cache.set('company:info', companyInfo, 86400); // 24 horas (casi nunca cambia)

// ❌ MAL - Sin TTL o TTL muy largo
cache.set('orders:all', orders); // Sin TTL = nunca expira
```

### 3. Paginación

```javascript
// ✅ BIEN - Siempre paginar listas grandes
const { count, rows } = await Order.findAndCountAll({
  ...req.pagination,
  where: filters
});

// ❌ MAL - Traer todos los registros
const orders = await Order.findAll(); // Puede ser millones
```

### 4. Manejo de Errores

```javascript
// ✅ BIEN - Errores específicos y descriptivos
throw new ValidationError('El email debe tener formato válido');
throw new NotFoundError('Cliente con ID 123');

// ❌ MAL - Errores genéricos
throw new Error('Error');
res.status(500).json({ msg: 'Algo salió mal' });
```

### 5. Invalidación de Caché

```javascript
// ✅ BIEN - Invalidar al modificar datos
exports.updateProduct = async (req, res) => {
  await Product.update(req.body, { where: { id: req.params.id } });
  cache.invalidatePattern('products:');
  res.json({ msg: 'Actualizado' });
};

// ❌ MAL - No invalidar = datos obsoletos en caché
exports.updateProduct = async (req, res) => {
  await Product.update(req.body, { where: { id: req.params.id } });
  res.json({ msg: 'Actualizado' });
};
```

---

## 🔧 Configuración Recomendada

### Desarrollo
```env
NODE_ENV=development
LOG_LEVEL=DEBUG
LOG_TO_FILE=false
```

### Producción
```env
NODE_ENV=production
LOG_LEVEL=INFO
LOG_TO_FILE=true
```

---

## 📚 Referencias Rápidas

### TTL Recomendados para Caché

| Tipo de Dato | TTL | Razón |
|-------------|-----|-------|
| Productos | 5 min | Inventario cambia frecuentemente |
| Clientes | 10 min | Datos relativamente estables |
| Categorías | 1 hora | Cambian raramente |
| Configuración | 24 horas | Casi nunca cambia |
| Reportes | 15 min | Balance entre frescura y rendimiento |

### Códigos de Estado HTTP

| Código | Uso | Clase de Error |
|--------|-----|---------------|
| 400 | Datos inválidos | ValidationError |
| 401 | No autenticado | UnauthorizedError |
| 403 | Sin permisos | ForbiddenError |
| 404 | No encontrado | NotFoundError |
| 409 | Conflicto | ConflictError |
| 500 | Error servidor | AppError |

---

## 🎓 Ejemplos Completos

### Controlador con Todas las Utilidades

```javascript
const { cache, cacheMiddleware } = require('../utils/cache');
const { formatPaginatedResponse } = require('../utils/pagination');
const { catchAsync, NotFoundError, ValidationError } = require('../middlewares/errorHandler.middleware');
const logger = require('../utils/logger');

// Listar con caché y paginación
exports.getAll = catchAsync(async (req, res) => {
  const cacheKey = `products:page:${req.pagination.page}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.debug('Cache hit for products list');
    return res.json(cached);
  }
  
  const { count, rows } = await Product.findAndCountAll({
    ...req.pagination,
    order: [['createdAt', 'DESC']]
  });
  
  const response = formatPaginatedResponse(rows, count, req.pagination);
  cache.set(cacheKey, response, 300);
  
  logger.info('Products list fetched', { count });
  res.json(response);
});

// Crear con validación y logging
exports.create = catchAsync(async (req, res) => {
  if (!req.body.name || !req.body.price) {
    throw new ValidationError('Nombre y precio son requeridos');
  }
  
  const product = await Product.create(req.body);
  
  // Invalidar caché
  cache.invalidatePattern('products:');
  
  // Log del evento
  logger.info('Product created', { 
    productId: product.id, 
    userId: req.user.id 
  });
  
  res.status(201).json(product);
});

// Actualizar
exports.update = catchAsync(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  
  if (!product) {
    throw new NotFoundError('Producto');
  }
  
  await product.update(req.body);
  
  cache.invalidatePattern('products:');
  logger.info('Product updated', { productId: product.id });
  
  res.json(product);
});
```

---

**Última Actualización:** Enero 25, 2026  
**Autor:** Andy Rosado  
**Versión:** 2.0.0
