# 🔐 Sistema de Permisos por Roles - CRM Lite

## Roles Disponibles

El sistema cuenta con 3 roles jerárquicos:

### 1. 👤 User (Usuario)
**Permisos:** Solo puede ver y gestionar SUS PROPIOS datos

#### Puede ver:
- ✅ Sus propios clientes
- ✅ Sus propios pedidos
- ✅ Sus propias cotizaciones
- ✅ Sus propias facturas
- ✅ Sus propios reportes y estadísticas
- ✅ Dashboard con sus métricas personales

#### NO puede ver:
- ❌ Clientes de otros usuarios
- ❌ Pedidos de otros usuarios
- ❌ Cotizaciones de otros usuarios
- ❌ Facturas de otros usuarios
- ❌ Panel de gestión de usuarios
- ❌ Estadísticas globales del sistema

---

### 2. 👥 Manager (Gerente)
**Permisos:** Puede ver TODO el sistema (datos de todos los usuarios)

#### Puede ver:
- ✅ **TODOS** los clientes del sistema
- ✅ **TODOS** los pedidos
- ✅ **TODAS** las cotizaciones
- ✅ **TODAS** las facturas
- ✅ Reportes globales con datos de todo el equipo
- ✅ Dashboard con métricas del equipo completo
- ✅ Productos del sistema

#### NO puede:
- ❌ Crear, editar o eliminar usuarios
- ❌ Acceder al panel de gestión de usuarios

**Nota:** En futuras versiones, los managers podrán gestionar equipos específicos.

---

### 3. 👑 Admin (Administrador)
**Permisos:** Control total del sistema

#### Puede:
- ✅ **TODO** lo que puede hacer un Manager
- ✅ Ver **TODOS** los usuarios del sistema
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes
- ✅ Eliminar usuarios (excepto auto-eliminarse)
- ✅ Cambiar contraseñas de usuarios
- ✅ Cambiar roles de usuarios
- ✅ Ver estadísticas completas del sistema
- ✅ Gestionar todos los módulos sin restricciones

---

## Tabla de Permisos por Módulo

| Módulo | User | Manager | Admin |
|--------|------|---------|-------|
| **Dashboard** | Solo sus datos | Todo el equipo | Todo el sistema |
| **Clientes** | Solo sus clientes | Todos los clientes | Todos los clientes |
| **Pedidos** | Solo sus pedidos | Todos los pedidos | Todos los pedidos |
| **Productos** | Ver todos | Ver y gestionar | Ver y gestionar |
| **Cotizaciones** | Solo sus cotizaciones | Todas las cotizaciones | Todas las cotizaciones |
| **Facturas** | Solo sus facturas | Todas las facturas | Todas las facturas |
| **Reportes** | Solo sus ventas | Todas las ventas | Todas las ventas |
| **Usuarios** | ❌ Sin acceso | ❌ Sin acceso | ✅ Gestión completa |
| **Notificaciones** | Solo sus notificaciones | Todas | Todas |

---

## Ejemplos de Uso

### Escenario 1: Empresa Pequeña (2-5 personas)
```
1 Admin (dueño)
2-4 Users (vendedores)
```
- Cada vendedor gestiona su cartera de clientes
- El admin supervisa todo y ayuda cuando es necesario
- No hay conflictos por clientes

### Escenario 2: Empresa Mediana (10-20 personas)
```
1 Admin (dueño/gerente general)
2-3 Managers (gerentes de área)
10-15 Users (vendedores)
```
- Los managers supervisan a los vendedores
- Pueden ver todas las ventas para coordinar
- El admin gestiona usuarios y configuraciones

### Escenario 3: Empresa Grande (20+ personas)
```
1-2 Admins (dirección)
5-10 Managers (gerentes de área/región)
20+ Users (vendedores)
```
- Estructura jerárquica completa
- Managers supervisan equipos específicos
- Control total desde administración

---

## Seguridad Implementada

### Backend (Controladores)
Todos los controladores validan el rol antes de retornar datos:

```javascript
// Sistema de permisos por rol
if (req.user.role === 'user') {
  whereClause = { user_id: req.user.id };  // Solo sus datos
} else if (req.user.role === 'manager') {
  whereClause = {};  // Todos los datos
} else if (req.user.role === 'admin') {
  whereClause = {};  // Todos los datos
}
```

### Frontend (Componentes)
- Rutas protegidas con `ProtectedRoute`
- Validación de rol en componentes
- UI condicional según permisos
- Links en navbar según rol

---

## Futuras Mejoras

### Versión 2.1 (Próximamente)
- [ ] Managers gestionan equipos específicos
- [ ] Asignación de vendedores a managers
- [ ] Permisos granulares personalizables

### Versión 3.0 (Futuro)
- [ ] Roles personalizados
- [ ] Permisos por módulo individual
- [ ] Auditoría de acciones por usuario
- [ ] Logs de seguridad detallados

---

## Cómo Cambiar el Rol de un Usuario

1. **Iniciar sesión como Admin**
2. **Ir a "Usuarios"** en el navbar
3. **Hacer clic en "Editar"** del usuario
4. **Seleccionar nuevo rol** en el dropdown
5. **Guardar cambios**

El usuario verá inmediatamente los cambios al refrescar la página.

---

## Preguntas Frecuentes

**P: ¿Puede un usuario ver clientes de otros?**  
R: No, solo ve sus propios clientes. Managers y Admins sí pueden ver todos.

**P: ¿Puede un manager crear usuarios?**  
R: No, solo los Admins pueden crear usuarios.

**P: ¿Qué pasa si un user necesita eliminar un usuario?**  
R: Debe solicitarlo a un Admin. Los users no tienen acceso al módulo de usuarios.

**P: ¿Los managers pueden cambiar roles?**  
R: No, solo los Admins pueden cambiar roles de usuarios.

**P: ¿Cómo se protegen los datos sensibles?**  
R: Todas las consultas al backend validan el rol antes de retornar datos. Es imposible acceder a datos sin permisos.

---

## Contacto de Soporte

Para dudas sobre permisos o roles:
- Contactar al Administrador del sistema
- Revisar este documento
- Consultar la documentación técnica en `/backend/src/controllers/`

---

**Última actualización:** Enero 2026  
**Versión del sistema:** 2.0.0
