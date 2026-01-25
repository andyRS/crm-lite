# CRM Lite ERP - Frontend

## 👨‍💻 Desarrollador
**Andy Rosado** - Ingeniero de Sistemas | Desarrollador Web Full Stack

---

## 📋 Descripción

Frontend del sistema CRM Lite ERP desarrollado con React 19 y Vite. Interfaz moderna y responsiva para gestión empresarial completa con actualizaciones en tiempo real.

## 🏗️ Arquitectura

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── api/            # Configuración de Axios
│   ├── assets/         # Imágenes, iconos
│   ├── components/     # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── QuotePDF.jsx
│   │   └── ErrorBoundary.jsx
│   ├── context/        # Context API
│   │   └── AuthContext.jsx
│   ├── pages/          # Páginas principales
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Customers.jsx
│   │   ├── Products.jsx
│   │   ├── Quotes.jsx
│   │   ├── Orders.jsx
│   │   └── Invoices.jsx
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── .env                # Variables de entorno
└── vite.config.js      # Configuración de Vite
```

## 🎨 Características de UI/UX

### Diseño Responsivo
- ✅ Optimizado para desktop, tablet y móvil
- ✅ Tailwind CSS para estilos consistentes
- ✅ Heroicons para iconografía moderna
- ✅ Temas claros con paleta de colores profesional

### Componentes Avanzados
- 📊 Gráficos interactivos con Recharts
- 📄 Vista modal centrada para documentos
- 🖨️ Plantillas de impresión profesionales A4/Carta
- 🔔 Sistema de notificaciones con Toast
- 🎯 Loading states y skeletons
- ❌ Error boundaries para captura de errores

### Funcionalidades Destacadas

#### 💰 Sistema Multi-Moneda
- Selector de moneda (RD$ / US$) en formularios
- Conversión automática de símbolos
- Persistencia de preferencia de moneda
- Visualización clara en documentos

#### 🖨️ Documentos Profesionales
- Cotizaciones con formato tipo factura
- Plantillas optimizadas para impresión
- Vista previa antes de imprimir
- Botón flotante de impresión
- CSS específico para @page

#### 📱 Navegación Intuitiva
- Menú lateral colapsable
- Breadcrumbs para ubicación
- Búsqueda rápida
- Filtros avanzados
- Paginación eficiente

## 🚀 Instalación

### Requisitos Previos
- Node.js v18+
- npm o yarn
- Backend corriendo en puerto 5000

### Pasos de Instalación

1. **Navegar al directorio**
```bash
cd crm-lite/frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Contenido de `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

5. **Build para producción**
```bash
npm run build
npm run preview  # Preview del build
```

## 📦 Dependencias Principales

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.1.3",
  "axios": "^1.7.9",
  "jwt-decode": "^4.0.0",
  "socket.io-client": "^4.8.1",
  "recharts": "^2.15.0",
  "react-hot-toast": "^2.4.1",
  "@heroicons/react": "^2.2.0"
}
```

## 🎯 Páginas y Funcionalidades

### Login
- Formulario de autenticación
- Validación en tiempo real
- Recuerda sesión
- Redirección automática

### Dashboard
- Métricas principales en tarjetas
- Gráficos de ventas mensuales
- Lista de actividad reciente
- Accesos rápidos a módulos
- Actualización en tiempo real

### Clientes
- Lista paginada con búsqueda
- Formulario de creación/edición modal
- Vista detallada de cliente
- Límite de crédito
- Historial de transacciones

### Productos
- Catálogo con categorías
- Gestión de inventario
- Alertas de stock bajo
- SKU único
- Búsqueda y filtros

### Cotizaciones
- **Formulario con selector de moneda**
- Vista modal centrada profesional
- Tabla de productos con descuentos
- Cálculo automático de totales
- Estados: borrador, enviada, aprobada, rechazada
- Conversión a orden
- Impresión optimizada
- Soporte de clientes registrados y nuevos

### Órdenes
- Gestión de estados (pendiente, confirmado, procesando, enviado, entregado)
- Vista de detalle modal
- Tracking de envíos
- Estados de pago

### Facturas
- **Soporte multi-moneda (DOP/USD)**
- Dashboard con estadísticas
- Gestión de estados (borrador, pendiente, pagada, vencida)
- Edición de facturas pendientes
- Eliminación con confirmación
- Vista de impresión profesional
- Integración con pagos
- Cálculo de impuestos (ITBIS 18%)
- Sistema de descuentos

### Notificaciones
- Centro de notificaciones
- Contador de no leídas
- Marca como leída
- Tipos: info, warning, success, error
- Actualización en tiempo real con Socket.IO

## 🔐 Sistema de Autenticación

### AuthContext
- Gestión global del estado de autenticación
- Almacenamiento de token en localStorage
- Decodificación automática de JWT
- Refresh automático de token
- Protección de rutas

### ProtectedRoute
- Componente wrapper para rutas privadas
- Redirección automática a login
- Verificación de roles
- Persistencia de sesión

## 🎨 Estilos y Temas

### Tailwind CSS
- Clases de utilidad personalizadas
- Diseño responsivo con breakpoints
- Colores corporativos:
  - Primary: Indigo (#4F46E5)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Error: Red (#EF4444)

### Componentes de UI
- Botones con estados hover/active
- Inputs con validación visual
- Modales con backdrop
- Alerts y toasts
- Badges de estado
- Loading spinners
- Progress bars

## 📱 Características Responsivas

### Mobile First
- Diseño adaptable desde 320px
- Menú hamburguesa en móvil
- Tablas scrollables horizontalmente
- Touch-friendly buttons
- Bottom sheets para acciones

### Breakpoints
- sm: 640px (tablets)
- md: 768px (tablets landscape)
- lg: 1024px (desktop)
- xl: 1280px (desktop large)
- 2xl: 1536px (desktop XL)

## 🖨️ Sistema de Impresión

### Cotizaciones
```jsx
// CSS específico para impresión
@media print {
  .no-print { display: none; }
  @page {
    size: A4;
    margin: 15mm 10mm;
  }
}
```

### Facturas
- Plantilla profesional con header
- Logo de empresa
- Información de factura y cliente
- Tabla de productos detallada
- Totales con impuestos
- Términos y condiciones
- Footer con copyright

## 🔄 Actualizaciones en Tiempo Real

### Socket.IO Client
- Conexión persistente con backend
- Escucha de eventos:
  - `new-notification`: Nuevas notificaciones
  - `order-updated`: Actualización de órdenes
  - `payment-received`: Confirmación de pagos
- Reconexión automática
- Manejo de desconexiones

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## 🚀 Build y Despliegue

### Build de Producción
```bash
npm run build
# Output en /dist
```

### Variables de Entorno de Producción
```env
VITE_API_URL=https://api.tudominio.com/api
VITE_SOCKET_URL=https://api.tudominio.com
```

### Despliegue
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: `npm run deploy`
- **Docker**: Ver Dockerfile incluido

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    root /var/www/crm-lite/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Configuración de Vite

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

## 📊 Optimizaciones de Rendimiento

- ⚡ Code splitting automático con Vite
- 🎯 Lazy loading de rutas
- 💾 Memoización con useMemo/useCallback
- 📦 Tree shaking automático
- 🖼️ Optimización de imágenes
- 📝 Caché de peticiones con Axios
- 🔄 Debounce en búsquedas
- ♻️ Virtual scrolling para listas grandes

## 🐛 Debugging

```bash
# Modo desarrollo con sourcemaps
npm run dev

# Analizar bundle
npm run build
npx vite-bundle-visualizer
```

## 📝 Convenciones de Código

### Estructura de Componentes
```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Component
export default function MyComponent() {
  // 3. States
  const [data, setData] = useState([]);
  
  // 4. Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // 5. Functions
  const loadData = async () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>...</div>
  );
}
```

### Naming Conventions
- Components: PascalCase (MyComponent.jsx)
- Functions: camelCase (loadData)
- Constants: UPPER_SNAKE_CASE (API_URL)
- CSS Classes: kebab-case (my-class)

## 📞 Soporte

**Desarrollado por:** Andy Rosado  
**Email:** [tu-email]  
**GitHub:** [tu-github]

---

© 2026 CRM Lite ERP Frontend. Desarrollado por Andy Rosado.