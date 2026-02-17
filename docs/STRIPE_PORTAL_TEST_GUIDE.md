# 💳 Stripe Portal Test Guide

This guide provides instructions for testing the Stripe integration in Onyx Suite 2026, covering Checkout, the Customer Portal, and Webhooks.

---

## 🛠️ Entorno de Pruebas (Test Mode)

La aplicación debe estar configurada en **Modo de Prueba** para evitar cargos reales.

1. **API Keys**: Asegúrate de que las variables de entorno en `.env.local` usen las claves de prueba de Stripe (`pk_test_...` y `sk_test_...`).
2. **Stripe Dashboard**: Accede a [dashboard.stripe.com/test/dashboard](https://dashboard.stripe.com/test/dashboard) para monitorear los eventos.

---

## 💳 Tarjetas de Prueba

Usa las siguientes tarjetas para simular diferentes escenarios:

| Escenario | Número de Tarjeta | MM/YY | CVC |
|-----------|-------------------|-------|-----|
| **Éxito (Visa)** | `4242 4242 4242 4242` | `12/34` | `123` |
| **Éxito (Mastercard)** | `5555 4444 4444 4444` | `12/34` | `123` |
| **3D Secure** | `4000 0000 0000 3155` | `12/34` | `123` |
| **Declinada (Fondos)** | `4000 0000 0000 9995` | `12/34` | `123` |

---

## 🚀 Flujo de Checkout

### 1. Seleccionar un Plan
Ve a **Configuración → Suscripción** y elige uno de los planes disponibles:
- **Onyx Familia Mensual**: 4.99€/mes
- **Onyx Familia Anual**: 49.99€/año

### 2. Proceso de Pago
- Serás redirigido a Stripe Checkout.
- Ingresa un email de prueba y una de las tarjetas de arriba.
- Al finalizar, serás redirigido a la página de éxito en Onyx Suite.

### 3. Verificación
- Verifica que el Dashboard de Onyx Suite refleje el nivel de suscripción correcto.
- Verifica en el Dashboard de Stripe que se haya creado el `Customer` y la `Subscription`.

---

## 🛠️ Customer Portal (Gestión de Suscripción)

El Portal de Clientes permite a los usuarios gestionar su suscripción sin salir de la app.

### 1. Acceso
- Ve a **Configuración → Suscripción**.
- Haz clic en **"Gestionar Facturación"** o **"Abrir Portal"**.

### 2. Acciones a Probar
- **Cambio de Plan**: Cambia de Mensual a Anual (y viceversa). Verifica el prorrateo.
- **Actualizar Pago**: Cambia la tarjeta de crédito guardada.
- **Cancelación**: Cancela la suscripción. Debe permanecer activa hasta el final del periodo.
- **Reactivación**: Si la suscripción está "pendiente de cancelación", prueba a reactivarla.

---

## ⚓ Webhooks (Local Testing)

Para probar los webhooks localmente, usa el **Stripe CLI**.

1. **Iniciar escucha**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
2. **Copiar Secret**: Copia el `whsec_...` que devuelve el comando y ponlo en `STRIPE_WEBHOOK_SECRET` en tu `.env.local`.
3. **Simular eventos**: Puedes disparar eventos manualmente para probar la lógica de sincronización:
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## 🧪 Componente de Debugging

Existe un componente dedicado para pruebas rápidas en desarrollo:
`components/features/stripe/StripePortalTest.tsx`

Este componente permite:
- Ver el estado actual de la suscripción (`status`, `tier`).
- Forzar la apertura del portal con un Customer ID específico.
- Ver logs de depuración directamente en la UI.

**Ruta de acceso recomendada**: `/debug/stripe` (si está configurada en el router) o inclúyelo temporalmente en tu vista.

---

## 🆘 Problemas Comunes

- **Error: "No checkout URL returned"**: Verifica que el servidor de API local esté corriendo y que las claves secretas sean válidas.
- **Suscripción no se actualiza**: Verifica que el Webhook esté configurado correctamente y que el túnel (Stripe CLI) esté activo.
- **Customer ID duplicado**: Asegúrate de que cada usuario de Supabase tenga un único `stripe_customer_id` en la tabla `user_subscriptions`.

---

*Actualizado: Febrero 2026*
