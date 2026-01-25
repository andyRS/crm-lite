# 🚀 Guía Rápida de Desarrollo

**Para empezar rápido - Lee esto primero**

---

## ⚡ Startup Rápido (2 minutos)

### 1. Instalar Dependencias
```bash
# Backend
cd backend
npm install

# Frontend (en otra carpeta)
cd ../frontend
npm install
```

### 2. Configurar .env
```bash
# backend/.env
DB_NAME=crm_lite_db
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
PORT=5000
JWT_SECRET=mi_secreto_jwt
```

### 3. Crear Base de Datos
```bash
mysql -u root -p
CREATE DATABASE crm_lite_db;
EXIT;
```

### 4. Ejecutar
```bash
# Terminal 1
cd backend && npm run start

# Terminal 2
cd frontend && npm run dev
```

**✅ Listo!** Accede a http://localhost:5173

---

## 📡 Estructura de Carpetas Rápida

```
backend/src/
├── app.js              👈 Configuración Express
├── server.js           👈 Servidor + Socket.IO
├── models/             👈 Modelos Sequelize
├── controllers/        👈 Lógica de negocio
├── routes/             👈 Endpoints API
├── middlewares/        👈 Auth, seguridad
└── config/db.js        👈 Conexión MySQL

frontend/src/
├── App.jsx             👈 Rutas principales
├── pages/              👈 Página por módulo
├── components/         👈 Componentes reutilizables
├── context/            👈 AuthContext (global)
├── api/axios.js        👈 Cliente HTTP
└── main.jsx            👈 Entry point
```

---

## 🔌 Arquitectura

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Vite)             │
│         http://localhost:5173              │
└────────────────┬──────────────────────────┘
                 │ HTTP + CORS
                 │
┌────────────────▼──────────────────────────┐
│      Backend (Express.js)                  │
│      http://localhost:5000/api            │
└────────────────┬──────────────────────────┘
                 │ SQL Queries
                 │
┌────────────────▼──────────────────────────┐
│    Database (MySQL)                        │
│    crm_lite_db                            │
└─────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación

```
1. Usuario login → POST /api/auth/login
2. Backend verifica → bcrypt
3. Backend crea → JWT token
4. Frontend guarda → localStorage
5. Frontend agrega header → Authorization: Bearer {token}
6. Backend verifica → auth.middleware.js
```

---

## 📝 Tareas Comunes

### Agregar una nueva ruta
```javascript
// backend/src/routes/mimodulo.routes.js
const express = require('express');
const router = express.Router();
const { miController } = require('../controllers/mimodulo.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, miController.getAll);
router.post('/', authenticateToken, miController.create);

module.exports = router;

// Luego registrar en app.js:
app.use("/api/mimodulo", miModuloRoutes);
```

### Crear un modelo
```javascript
// backend/src/models/mimodelo.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MiModelo = sequelize.define('MiModelo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = MiModelo;

// Luego agregar en models/index.js:
const MiModelo = require('./mimodelo.model');
module.exports = { User, MiModelo, ... };
```

### Agregar una página
```jsx
// frontend/src/pages/MiPagina.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function MiPagina() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    api.get('/mimodulo')
      .then(res => setDatos(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Mi Página</h1>
      {datos.map(item => (
        <div key={item.id}>{item.nombre}</div>
      ))}
    </div>
  );
}

// Luego agregar en App.jsx:
import MiPagina from './pages/MiPagina';
<Route path="/mi-pagina" element={<ProtectedRoute><MiPagina /></ProtectedRoute>} />
```

---

## 🐛 Troubleshooting

### "CORS error"
**Solución:** Verifica que `vite.config.js` tenga `host: 'localhost'`

### "Cannot GET /"
**Solución:** El servidor no está escuchando. Verifica que ambos procesos estén vivos

### "JWT inválido"
**Solución:** Token expiró. Vuelve a login

### "Database connection refused"
**Solución:** MySQL no está corriendo o credenciales .env son incorrectas

### "Module not found"
**Solución:** Ejecuta `npm install` en la carpeta de Backend o Frontend

---

## 🎯 Próximos Pasos

1. **Completar Modelos** → Descomentar `sequelize.sync()` en server.js
2. **Habilitar Socket.IO** → Descomentar en server.js para notificaciones
3. **Implementar Seguridad** → Descomentar Helmet, rate limiting en app.js
4. **Agregar Tests** → Jest + React Testing Library
5. **Preparar Producción** → Docker + CI/CD

---

## 📚 Stack Resumido

| Parte | Tech |
|-------|------|
| Backend | Node.js + Express + MySQL + Sequelize |
| Frontend | React 19 + Vite + Tailwind |
| Auth | JWT + bcryptjs |
| Tiempo Real | Socket.IO |
| HTTP | Axios |

---

## 🔗 URLs Importantes

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Base: http://localhost:5000/api
- Test: http://localhost:5000/test

---

**¿Preguntas?** Ver SYSTEM_DOCUMENTATION.md para documentación completa.
