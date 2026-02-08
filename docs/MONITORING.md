# 📊 Sistema de Monitoreo y Observabilidad

## Descripción General

Onyx Suite 2026 incluye un sistema completo de monitoreo y observabilidad que permite:
- **Error Tracking** con Sentry
- **Analytics** con Vercel Analytics  
- **Performance Monitoring** con Web Vitals
- **Logging estructurado** para debugging

## 🚀 Configuración Inicial

### 1. Crear Cuenta en Sentry

1. Ve a [sentry.io](https://sentry.io) y crea una cuenta gratuita
2. Crea un nuevo proyecto:
   - Selecciona **React** como plataforma
   - Nombra el proyecto (ej: `onyx-suite-2026`)
3. Copia el **DSN** que te proporciona Sentry

### 2. Activar Vercel Analytics

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Analytics**
3. Activa **Web Analytics** (incluido gratis)

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```bash
# Monitoring & Analytics
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Sentry Build Configuration (solo para producción)
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=onyx-suite-2026
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### 4. Obtener Auth Token de Sentry (para Source Maps)

1. En Sentry, ve a **Settings** → **Auth Tokens**
2. Crea un nuevo token con permisos de `project:releases`
3. Copia el token y agrégalo a `.env.local`

## 📦 Servicios Disponibles

### MonitoringService

Servicio centralizado para error tracking y performance monitoring.

```typescript
import { monitoringService } from './services/monitoringService';

// Inicializar (se hace automáticamente en App.tsx)
monitoringService.init();

// Capturar errores
try {
  // código que puede fallar
} catch (error) {
  monitoringService.captureError(error, {
    component: 'TransactionForm',
    action: 'submit',
  });
}

// Agregar contexto de usuario
monitoringService.setUserContext({
  id: 'user123',
  email: 'user@example.com',
  username: 'John Doe',
});

// Agregar breadcrumbs para debugging
monitoringService.addBreadcrumb('User clicked submit', 'user-action', {
  formId: 'transaction-form',
});

// Agregar contexto personalizado
monitoringService.setContext('transaction', {
  amount: 50,
  category: 'food',
});
```

### AnalyticsService

Servicio para tracking de eventos y analytics.

```typescript
import { analyticsService } from './services/analyticsService';

// Track eventos personalizados
analyticsService.trackEvent('custom_event', {
  property1: 'value1',
  property2: 123,
});

// Track page views
analyticsService.trackPageView('dashboard', {
  section: 'finance',
});

// Track eventos financieros
analyticsService.trackFinancialEvent('transaction_created', {
  amount: 50,
  category: 'food',
});

// Track uso de IA
analyticsService.trackAIUsage('recipe_generation', {
  ingredients: 5,
  servings: 4,
});
```

### PerformanceService

Servicio para métricas de performance.

```typescript
import { performanceService } from './services/performanceService';

// Medir funciones async
const result = await performanceService.measureAsync('fetchData', async () => {
  return await fetch('/api/data');
});

// Medir funciones sync
const data = performanceService.measure('processData', () => {
  return heavyComputation();
});

// Usar marks manuales
performanceService.startMark('component_render');
// ... código a medir
performanceService.endMark('component_render');

// Track API calls
performanceService.trackAPICall('/api/transactions', 'GET', 250, 200);

// Obtener métricas
const metrics = performanceService.getMetrics();
const average = performanceService.getAverageMetric('api_GET_/api/transactions');
```

### useAnalytics Hook

Hook de React para tracking en componentes.

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

function TransactionForm() {
  const { trackEvent, trackFinancialEvent } = useAnalytics();

  const handleSubmit = (data) => {
    // Crear transacción...
    
    trackFinancialEvent('transaction_created', {
      amount: data.amount,
      category: data.category,
    });
  };

  return (
    // JSX...
  );
}
```

## 📋 Eventos Trackeados

### Eventos Financieros
- `transaction_created` - Nueva transacción
- `budget_created` - Nuevo presupuesto
- `goal_created` - Nueva meta
- `debt_created` - Nueva deuda

### Eventos de IA
- `ai_usage` - Uso de features de IA
  - `recipe_generation` - Generación de recetas
  - `trip_planning` - Planificación de viajes
  - `predictive_analysis` - Análisis predictivo

### Eventos de Usuario
- `page_view` - Navegación entre páginas
- `user_action` - Acciones del usuario
- `user_error` - Errores de validación

## 🔍 Debugging en Producción

### Ver Errores en Sentry

1. Ve a tu proyecto en Sentry
2. En **Issues**, verás todos los errores capturados
3. Haz click en un error para ver:
   - Stack trace completo
   - Información del usuario
   - Breadcrumbs (acciones previas)
   - Contexto adicional

### Ver Analytics en Vercel

1. Ve a tu proyecto en Vercel
2. En **Analytics**, verás:
   - Page views
   - Eventos personalizados
   - Web Vitals
   - Datos demográficos

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm run test -- monitoringService.test.ts
npm run test -- analyticsService.test.ts
npm run test -- performanceService.test.ts

# Todos los tests
npm run test

# Con coverage
npm run test:coverage
```

## 🚀 Deployment

### Build para Producción

```bash
# Build con source maps
npm run build
```

Los source maps se subirán automáticamente a Sentry si tienes configurado `SENTRY_AUTH_TOKEN`.

### Verificar Source Maps

1. Haz un build de producción
2. Verifica que existan archivos `.map` en `dist/`
3. En Sentry, ve a **Settings** → **Source Maps** para verificar que se subieron

## 📊 Métricas Clave

### Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms
- **INP (Interaction to Next Paint)**: < 200ms

### Performance Thresholds

- API calls > 3s se reportan como "slow"
- Long tasks > 100ms se reportan a Sentry

## 🔒 Privacidad

- Los datos de usuario se enmascaran en Session Replay
- Solo se envían errores de severidad media/alta a Sentry
- Analytics solo trackea eventos, no PII (Personally Identifiable Information)

## 🆘 Troubleshooting

### Sentry no captura errores

1. Verifica que `VITE_SENTRY_DSN` esté configurado
2. Verifica que no estés en modo desarrollo (Sentry se desactiva en dev)
3. Revisa la consola para mensajes de inicialización

### Analytics no aparece en Vercel

1. Verifica que `VITE_ENABLE_ANALYTICS=true`
2. Espera unos minutos (los datos pueden tardar en aparecer)
3. Verifica que el componente `<Analytics />` esté montado en `App.tsx`

### Source Maps no se suben

1. Verifica que `SENTRY_AUTH_TOKEN` esté configurado
2. Verifica que el token tenga permisos de `project:releases`
3. Revisa los logs del build para errores del plugin de Sentry

## 📚 Recursos

- [Documentación de Sentry](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Documentación de Vercel Analytics](https://vercel.com/docs/analytics)
- [Web Vitals](https://web.dev/vitals/)
