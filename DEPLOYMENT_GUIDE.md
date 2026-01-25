# 🚀 Guía de Despliegue - CRM Lite ERP

Esta guía te llevará paso a paso para desplegar tu aplicación CRM Lite ERP en producción usando servicios gratuitos.

## 📋 Servicios Recomendados

### Backend
- **Render.com** (Gratis) - Para API Node.js + Express
- Alternativa: Railway.app, Fly.io

### Frontend
- **Vercel** (Gratis, recomendado) - Optimizado para React/Vite
- **Netlify** (Gratis, alternativa) - También excelente para React

### Base de Datos
- **Railway.app** (Gratis con $5 de crédito/mes) - MySQL
- **PlanetScale** (Gratis) - MySQL compatible
- **Render PostgreSQL** (Gratis) - Requiere adaptar código a PostgreSQL

---

## 🗄️ PASO 1: Configurar Base de Datos

### Opción A: Railway MySQL (Recomendado)

1. **Crear cuenta en Railway:**
   - Ve a https://railway.app/
   - Regístrate con GitHub
   - Obtienes $5 de crédito gratis mensual

2. **Crear proyecto MySQL:**
   ```bash
   - Clic en "New Project"
   - Selecciona "Provision MySQL"
   - Railway creará automáticamente la base de datos
   ```

3. **Obtener credenciales:**
   - Clic en el servicio MySQL
   - Ve a la pestaña "Variables"
   - Copia las siguientes variables:
     ```
     MYSQL_HOST
     MYSQL_PORT (3306)
     MYSQL_DATABASE
     MYSQL_USER
     MYSQL_PASSWORD
     MYSQL_URL (conexión completa)
     ```

4. **Permitir conexiones externas:**
   - Railway permite conexiones por defecto
   - No necesita configuración adicional

### Opción B: PlanetScale MySQL

1. **Crear cuenta:**
   - Ve a https://planetscale.com/
   - Regístrate gratis
   - Plan gratuito: 1 base de datos, 5GB storage

2. **Crear base de datos:**
   ```bash
   - Clic en "Create a new database"
   - Nombre: crm-lite-db
   - Región: US East (más cerca)
   - Clic en "Create database"
   ```

3. **Obtener credenciales:**
   - Clic en "Connect"
   - Selecciona "Node.js"
   - Copia host, username, password

---

## 🔧 PASO 2: Desplegar Backend en Render

### 2.1 Preparar Repositorio

1. **Asegúrate de que todo esté en GitHub:**
   ```bash
   cd "C:\Users\Andy3\Desktop\Proyectos Portafolio arosado\crm-lite"
   git add .
   git commit -m "chore: preparar para despliegue en producción"
   git push origin master
   ```

### 2.2 Crear Servicio en Render

1. **Crear cuenta en Render:**
   - Ve a https://render.com/
   - Regístrate con GitHub
   - Autoriza acceso a tus repositorios

2. **Crear nuevo Web Service:**
   ```bash
   - Clic en "New +"
   - Selecciona "Web Service"
   - Conecta tu repositorio crm-lite
   - Autoriza acceso
   ```

3. **Configurar el servicio:**
   ```yaml
   Name: crm-lite-backend
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Variables de Entorno en Render:**
   - Clic en "Environment" en el dashboard
   - Agrega las siguientes variables:

   ```env
   NODE_ENV=production
   PORT=10000
   
   # Base de datos (usar las de Railway/PlanetScale)
   DB_HOST=<tu_mysql_host>
   DB_PORT=3306
   DB_NAME=<tu_database_name>
   DB_USER=<tu_mysql_user>
   DB_PASSWORD=<tu_mysql_password>
   
   # JWT Secrets (genera claves seguras)
   JWT_SECRET=<genera_una_clave_larga_y_aleatoria>
   JWT_REFRESH_SECRET=<genera_otra_clave_diferente>
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   
   # CORS (se actualizará después del frontend)
   FRONTEND_URL=https://tu-frontend.vercel.app
   BACKEND_URL=https://crm-lite-backend.onrender.com
   
   # Company Info
   COMPANY_NAME=CRM Lite ERP
   COMPANY_EMAIL=info@crmlite.com
   COMPANY_PHONE=+1 (809) 555-1234
   COMPANY_ADDRESS=Santo Domingo, República Dominicana
   ```

   **Generar claves seguras (PowerShell):**
   ```powershell
   # JWT_SECRET
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
   
   # JWT_REFRESH_SECRET
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
   ```

5. **Desplegar:**
   - Clic en "Create Web Service"
   - Render comenzará a construir y desplegar
   - Espera 5-10 minutos
   - Tu backend estará en: `https://crm-lite-backend.onrender.com`

6. **Ejecutar migraciones:**
   - Una vez desplegado, ve a "Shell" en Render
   - Ejecuta:
   ```bash
   node src/migrations/add-currency-to-invoices.js
   node src/migrations/add-currency-to-quotes.js
   node src/seed.js
   ```

### 2.3 Verificar Backend

```bash
# Health check
curl https://crm-lite-backend.onrender.com/health

# Test endpoint
curl https://crm-lite-backend.onrender.com/test

# Login test
curl -X POST https://crm-lite-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"admin123"}'
```

---

## 🎨 PASO 3: Desplegar Frontend en Vercel

### 3.1 Actualizar Variables de Entorno del Frontend

1. **Crear archivo `.env.production` en frontend:**
   ```bash
   cd frontend
   # Crear archivo con las URLs de producción
   ```

   Contenido del archivo:
   ```env
   VITE_API_URL=https://crm-lite-backend.onrender.com/api
   VITE_SOCKET_URL=https://crm-lite-backend.onrender.com
   VITE_ENV=production
   ```

2. **Commit y push:**
   ```bash
   git add frontend/.env.production
   git commit -m "feat: agregar configuración de producción para frontend"
   git push origin master
   ```

### 3.2 Desplegar en Vercel

1. **Crear cuenta en Vercel:**
   - Ve a https://vercel.com/
   - Regístrate con GitHub
   - Autoriza acceso a repositorios

2. **Importar proyecto:**
   ```bash
   - Clic en "Add New..."
   - Selecciona "Project"
   - Importa tu repositorio crm-lite
   - Vercel detectará automáticamente que es un proyecto Vite
   ```

3. **Configurar proyecto:**
   ```yaml
   Project Name: crm-lite-frontend
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Variables de Entorno en Vercel:**
   - En "Environment Variables", agrega:
   ```env
   VITE_API_URL=https://crm-lite-backend.onrender.com/api
   VITE_SOCKET_URL=https://crm-lite-backend.onrender.com
   VITE_ENV=production
   ```

5. **Desplegar:**
   - Clic en "Deploy"
   - Vercel construirá y desplegará en ~2 minutos
   - Tu frontend estará en: `https://crm-lite-frontend.vercel.app`

### 3.3 Configurar Dominio Personalizado (Opcional)

1. **En Vercel:**
   - Ve a "Settings" > "Domains"
   - Puedes agregar un dominio personalizado
   - O usar el subdominio gratuito de Vercel

---

## 🔄 PASO 4: Actualizar CORS en Backend

1. **Actualizar variable en Render:**
   ```env
   FRONTEND_URL=https://crm-lite-frontend.vercel.app
   ```

2. **Render redesplegará automáticamente**

---

## ✅ PASO 5: Verificar Despliegue Completo

### Verificar Backend
```bash
# Health check
curl https://crm-lite-backend.onrender.com/health
# Debe responder: {"status":"ok","timestamp":"..."}

# API endpoints
curl https://crm-lite-backend.onrender.com/api/auth/login
# Debe dar error 400 (esperado sin credenciales)
```

### Verificar Frontend
1. Abre `https://crm-lite-frontend.vercel.app`
2. Debe cargar la página de login
3. Intenta iniciar sesión con:
   - Email: `admin@crm.com`
   - Password: `admin123`
4. Debe funcionar y redirigir al dashboard

### Verificar Conexión Completa
1. Login exitoso ✅
2. Dashboard carga con datos ✅
3. Notificaciones en tiempo real ✅
4. CRUD de clientes funciona ✅
5. Crear órdenes funciona ✅

---

## 🎯 PASO 6: Actualizar README en GitHub

Agrega las URLs de producción:

```markdown
## 🌐 Demo en Vivo

- **Frontend:** https://crm-lite-frontend.vercel.app
- **Backend API:** https://crm-lite-backend.onrender.com
- **Documentación:** https://github.com/andyRS/crm-lite

### Credenciales de Prueba:
- **Admin:** admin@crm.com / admin123
- **Manager:** manager@crm.com / manager123
- **User:** user@crm.com / user123
```

---

## 🐛 Troubleshooting

### Backend no responde

**Problema:** Render tarda en responder la primera vez
- **Causa:** Free tier pone el servicio en sleep después de 15 min de inactividad
- **Solución:** La primera carga tarda ~30 segundos (normal)

**Problema:** Error de conexión a base de datos
```bash
# Verificar credenciales:
# 1. En Railway/PlanetScale: Confirma que la DB está activa
# 2. En Render: Verifica variables DB_HOST, DB_USER, DB_PASSWORD
# 3. Prueba conexión desde Shell de Render
```

### Frontend no conecta con Backend

**Problema:** Network Error al hacer login
```bash
# Verificar:
# 1. VITE_API_URL en Vercel apunta a la URL correcta de Render
# 2. CORS en backend incluye la URL de Vercel
# 3. Backend está activo (visita /health)
```

**Solución:**
```bash
# Re-desplegar frontend
vercel --prod

# O desde Vercel dashboard:
# Settings > Environment Variables > Editar > Redeploy
```

### Socket.IO no funciona

**Problema:** Notificaciones en tiempo real no llegan
```bash
# Verificar:
# 1. VITE_SOCKET_URL en frontend
# 2. Render permite conexiones WebSocket (sí, por defecto)
# 3. Consola del navegador muestra conexión Socket.IO
```

---

## 📊 Límites de Servicios Gratuitos

### Render (Backend)
- ✅ 750 horas/mes (suficiente para 1 servicio 24/7)
- ⏱️ Se duerme después de 15 min de inactividad
- ⚡ Primera carga lenta (~30 segundos)
- 💾 512 MB RAM
- 🔄 Redespliegue automático con cada push a GitHub

### Vercel (Frontend)
- ✅ 100 GB bandwidth/mes
- ⚡ Deploy instantáneo (<2 min)
- 🌐 CDN global
- 🔄 Preview deployments para cada PR
- 📊 Analytics básico incluido

### Railway (Base de Datos)
- ✅ $5 crédito mensual gratis
- 💾 Hasta 10 GB storage
- ⚡ Sin límite de conexiones
- 🔒 Conexiones SSL incluidas

---

## 🚀 Próximos Pasos

1. **Monitoreo:**
   - Configura UptimeRobot para ping cada 5 minutos
   - Evita que Render duerma el servicio

2. **Dominio Personalizado:**
   - Compra dominio en Namecheap/GoDaddy
   - Configura en Vercel (frontend)
   - Opcional: Custom domain en Render (backend)

3. **CI/CD Automático:**
   - Ya configurado: push a master = deploy automático
   - Vercel y Render redesplegan automáticamente

4. **Analytics:**
   - Configura Google Analytics en frontend
   - Vercel Analytics (gratis)

5. **Backup Database:**
   - Railway: Backups automáticos
   - O configura cron job manual

---

## 📞 Comandos Útiles

### Ver logs en Render
```bash
# Desde dashboard de Render:
# Events > View Logs
```

### Redeployar manualmente
```bash
# Render:
# Manual Deploy > Clear build cache & deploy

# Vercel:
vercel --prod
```

### Actualizar variables de entorno
```bash
# Backend (Render):
# Dashboard > Environment > Edit > Save

# Frontend (Vercel):
# Settings > Environment Variables > Edit > Redeploy
```

---

## ✅ Checklist de Despliegue

- [ ] Base de datos creada en Railway/PlanetScale
- [ ] Backend desplegado en Render
- [ ] Migraciones ejecutadas en producción
- [ ] Seed ejecutado (usuarios de prueba)
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas en ambos
- [ ] CORS actualizado con URL del frontend
- [ ] Login funciona correctamente
- [ ] Dashboard carga datos
- [ ] CRUD completo funciona
- [ ] Socket.IO conecta correctamente
- [ ] README actualizado con URLs
- [ ] Proyecto en tu portafolio

---

## 🎉 ¡Listo!

Tu CRM Lite ERP está en producción y funcionando. Ahora puedes:

1. Compartir el link en tu portafolio
2. Agregarlo a tu CV
3. Mostrarlo en entrevistas
4. Compartir en LinkedIn

**URLs finales:**
- Frontend: https://crm-lite-frontend.vercel.app
- Backend: https://crm-lite-backend.onrender.com
- GitHub: https://github.com/andyRS/crm-lite

---

**¿Necesitas ayuda?**
- Documentación Render: https://render.com/docs
- Documentación Vercel: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
