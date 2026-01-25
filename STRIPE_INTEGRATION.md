# Integración de Stripe - CRM Lite

## ✅ Completado

La integración de Stripe ha sido implementada exitosamente en tu sistema CRM. Aquí está todo lo que se ha agregado:

## 🎯 Funcionalidades Implementadas

### 1. Cálculo Automático de Comisión
- **Comisión de Stripe**: 2.9% + $0.30 por transacción
- El cálculo se aplica automáticamente cuando seleccionas "Tarjeta" como método de pago
- La comisión se suma al total y se muestra claramente al cliente

### 2. Backend (Servidor)

#### Archivos Creados:
- `backend/src/controllers/stripe.controller.js` - Controlador de pagos con Stripe
- `backend/src/routes/stripe.routes.js` - Rutas de API para Stripe

#### Endpoints Disponibles:
- `GET /api/stripe/config` - Obtener clave pública de Stripe
- `POST /api/stripe/create-payment-intent` - Crear intención de pago (requiere autenticación)
- `POST /api/stripe/calculate-fee` - Calcular comisión (requiere autenticación)
- `POST /api/stripe/webhook` - Webhook para eventos de Stripe

### 3. Frontend (Interfaz)

#### Modificaciones en `frontend/src/pages/Invoices.jsx`:

**Cálculo de Totales con Comisión:**
```javascript
// Cuando el método de pago es "card", se agrega automáticamente:
Subtotal: $100.00
Impuesto (18%): $18.00
Subtotal: $118.00
Comisión Stripe (2.9% + $0.30): $3.72
Total a Cobrar: $121.72
```

**Modal de Pago Mejorado:**
- Muestra desglose completo del pago
- Indica claramente la comisión al cliente
- Valida datos de tarjeta
- Se conecta a Stripe para procesar el pago

## 🔧 Configuración Actual

### Variables de Entorno

**Backend (.env):**
```env
STRIPE_SECRET_KEY=sk_test_51QmYhTBSaTdcO0xf... (clave de prueba)
STRIPE_PUBLISHABLE_KEY=pk_test_51QmYhTBSaTdcO0xf... (clave de prueba)
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
```

**Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QmYhTBSaTdcO0xf... (clave de prueba)
```

> ⚠️ **IMPORTANTE**: Estas son claves de prueba de ejemplo. Para producción, debes:
> 1. Crear tu cuenta en https://dashboard.stripe.com
> 2. Obtener tus propias claves (test y live)
> 3. Reemplazar las claves en los archivos .env

## 💳 Flujo de Pago

### 1. Crear Factura
1. Usuario navega a "Facturación" → "Facturar Cliente"
2. Selecciona cliente, agrega productos
3. Selecciona método de pago

### 2. Si selecciona "Efectivo/Transferencia/Cheque":
- Factura se crea con estado "pending"
- Aparece en "Facturas Pendientes por Pago"
- No se cobra comisión de Stripe

### 3. Si selecciona "Tarjeta":
- Sistema calcula automáticamente la comisión (2.9% + $0.30)
- Muestra el total con comisión incluida
- Abre modal de pago con formulario de tarjeta
- Cliente ingresa: número de tarjeta, nombre, fecha de expiración, CVV
- Al procesar:
  - Se crea un Payment Intent en Stripe
  - Se cobra el monto CON la comisión incluida
  - Factura se marca como "paid" (pagada)
  - Aparece en lista de facturas pagadas

## 🧪 Cómo Probar

### Tarjetas de Prueba de Stripe:

**Tarjeta Exitosa:**
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/25)
CVV: Cualquier 3 dígitos (ej: 123)
```

**Tarjeta Declinada:**
```
Número: 4000 0000 0000 0002
Fecha: Cualquier fecha futura
CVV: Cualquier 3 dígitos
```

**Tarjeta con Fondos Insuficientes:**
```
Número: 4000 0000 0000 9995
Fecha: Cualquier fecha futura
CVV: Cualquier 3 dígitos
```

### Pasos para Probar:

1. **Iniciar Sesión en el CRM**
   - Usuario: tu_usuario@example.com
   - Contraseña: tu_contraseña

2. **Ir a Facturación**
   - Click en "Facturación" en el menú
   - Click en "Facturar Cliente"

3. **Crear Factura de Prueba**
   - Selecciona un cliente
   - Agrega un producto (ej: $100)
   - Observa el cálculo:
     - Subtotal: $100.00
     - Impuesto (18%): $18.00
     - Subtotal: $118.00

4. **Seleccionar Método de Pago: Tarjeta**
   - Observa cómo se agrega automáticamente:
     - Comisión Stripe: $3.72
     - Total a Cobrar: $121.72

5. **Procesar Pago**
   - Click en "Crear Factura"
   - Se abre el modal de pago
   - Ingresa tarjeta de prueba: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVV: 123
   - Click "Procesar Pago"

6. **Verificar Resultado**
   - Debe aparecer mensaje de éxito
   - Factura aparece en lista de facturas pagadas
   - Total registrado: $121.72 (incluyendo comisión)

## 📊 Ejemplo de Cálculo

**Escenario: Factura de $100**

```
Productos:
- Producto A: $50 x 1 = $50
- Producto B: $25 x 2 = $50
---------------------------------
Subtotal:                  $100.00
Impuesto (18%):            + $18.00
---------------------------------
Subtotal después de impuestos:  $118.00

SI PAGO ES CON TARJETA:
Comisión Stripe (2.9%):    + $3.42
Comisión Fija:             + $0.30
---------------------------------
Total a cobrar al cliente: $121.72
```

**Desglose para tu negocio:**
- Total cobrado: $121.72
- Comisión Stripe: -$3.72
- Recibes en tu cuenta: $118.00

## 🚀 Próximos Pasos

### Para Producción (cuando estés listo):

1. **Crear Cuenta de Stripe**
   - Ve a https://dashboard.stripe.com/register
   - Crea tu cuenta con datos reales de tu negocio

2. **Verificar Identidad**
   - Stripe te pedirá documentos de identificación
   - Información bancaria para recibir pagos

3. **Obtener Claves de Producción**
   - Dashboard → Developers → API keys
   - Copiar claves "Live" (no "Test")

4. **Actualizar Variables de Entorno**
   - Reemplaza en `backend/.env`:
     ```env
     STRIPE_SECRET_KEY=sk_live_tu_clave_real
     STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_real
     ```
   - Reemplaza en `frontend/.env`:
     ```env
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_real
     ```

5. **Configurar Webhook (Opcional pero Recomendado)**
   - Dashboard → Developers → Webhooks
   - Agregar endpoint: `https://tu-dominio.com/api/stripe/webhook`
   - Copiar signing secret y agregar a .env:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_tu_secret_real
     ```

## 📝 Notas Importantes

1. **Transparencia de Comisión**
   - La comisión se muestra SIEMPRE al cliente antes de cobrar
   - El cliente ve exactamente cuánto se está cobrando por procesamiento

2. **Soporte de Monedas**
   - Actualmente configurado para USD
   - Puede cambiarse a DOP (Pesos Dominicanos) en el código
   - Stripe soporta ambas monedas en República Dominicana

3. **Seguridad**
   - Los datos de tarjeta nunca pasan por tu servidor
   - Stripe maneja toda la información sensible
   - Cumple con PCI DSS Level 1

4. **Facturación**
   - Pagos con efectivo/transferencia: estado "pending"
   - Pagos con tarjeta: estado "paid" (automáticamente)
   - Historial completo de todas las transacciones

## 🆘 Resolución de Problemas

### Error: "La clave de Stripe no está configurada"
- **Solución**: Verifica que las claves estén en el archivo .env
- Reinicia el servidor backend después de agregar las claves

### Error: "Payment Intent failed"
- **Solución**: Verifica que estés usando una tarjeta de prueba válida
- Asegúrate de que la clave secreta de Stripe sea correcta

### No se muestra la comisión
- **Solución**: Asegúrate de seleccionar "Tarjeta" como método de pago
- Recarga la página del frontend

## 📞 Soporte

Para más información sobre Stripe:
- Documentación: https://stripe.com/docs
- Soporte: https://support.stripe.com

## 🎉 ¡Listo para Usar!

Tu sistema CRM ahora tiene integración completa con Stripe. Puedes comenzar a procesar pagos con tarjeta inmediatamente en modo de prueba, y cuando estés listo, activar el modo producción.

**¡Felicidades! La integración está completa y funcionando. 🚀**
