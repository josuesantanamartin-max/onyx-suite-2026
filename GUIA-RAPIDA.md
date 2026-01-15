# 🚀 Guía Rápida - Onyx Suite

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Instalar Node.js (si no lo tienes)

**Descarga e instala Node.js desde:**
- 🌐 https://nodejs.org/
- **Recomendado:** Versión LTS (Long Term Support)

**⚠️ IMPORTANTE después de instalar:**

**Opción A - Reiniciar PowerShell (Recomendado):**
1. Cierra todas las ventanas de PowerShell abiertas
2. Abre una nueva ventana de PowerShell
3. Navega al directorio del proyecto: `cd "ruta\a\Onyx-Suite-main\Onyx-Suite-main"`

**Opción B - Recargar PATH sin cerrar:**
Ejecuta el script: `.\RECARGAR-PATH.ps1`

**Verificar instalación:**
```powershell
node --version
npm --version
```

### 2️⃣ Instalar Dependencias

Abre PowerShell en el directorio del proyecto y ejecuta:

```powershell
npm install
```

### 3️⃣ Ejecutar la Aplicación

**Opción A - Script Automático:**
```powershell
.\EJECUTAR-APP.ps1
```

**Opción B - Manual:**
```powershell
npm run dev
```

### 4️⃣ Abrir en el Navegador

La aplicación estará disponible en:
- 🔗 **http://localhost:3000**

---

## 🎯 Funcionalidades de Onyx Suite

### 📊 Dashboard Global
- Vista 360° de tu vida financiera y personal
- Widgets personalizables
- Sincronización en tiempo real

### 💰 Módulo de Finanzas
- **Transacciones:** Ingresos, gastos, transferencias
- **Cuentas:** Múltiples cuentas bancarias
- **Presupuestos:** Control de gastos por categoría
- **Metas:** Ahorro para objetivos específicos
- **Deudas:** Seguimiento de préstamos y tarjetas

### 🏠 Módulo de Vida
- **Cocina:** Despensa, recetas, planificador de comidas
- **Lista de Compras:** Organización inteligente
- **Viajes:** Planificación y presupuestos de viaje
- **Familia:** Gestión de miembros y tareas

### ⚙️ Configuración
- Personalización de categorías
- Reglas de automatización
- Multi-idioma (ES, EN, FR)
- Multi-moneda (EUR, USD, GBP)

---

## 🔑 Configuración de API Keys (Opcional)

Para funcionalidades avanzadas con IA:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Añade tus API keys:

```env
VITE_GEMINI_API_KEY=tu-api-key-de-gemini
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-key-de-supabase
```

**Nota:** La aplicación funciona en **modo demo** sin estas keys.

---

## 🛠️ Comandos Disponibles

```powershell
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Verificar código
npm run test       # Ejecutar tests
```

---

## ❓ Solución de Problemas

### Error: "npm no se reconoce"
**Solución:** Node.js no está instalado o no está en el PATH
- Instala Node.js desde nodejs.org
- Reinicia PowerShell después de instalar

### Error: "Puerto 3000 en uso"
**Solución:** Cambia el puerto en `vite.config.ts` o cierra la aplicación que usa el puerto

### Error: "Dependencias no instaladas"
**Solución:** Ejecuta `npm install` nuevamente

---

## 📱 Modo Demo

Onyx Suite incluye un **modo demo** que funciona sin configuración:
- No requiere cuenta
- Datos almacenados localmente
- Funcionalidad completa disponible

Al iniciar la app, selecciona **"Probar Demo (Sin Cuenta)"**

---

## 🎨 Características Destacadas

✨ **Interfaz Moderna:** Diseño limpio y profesional  
🚀 **Rápido:** Optimizado para rendimiento  
🔒 **Privado:** Datos locales por defecto  
🌐 **Multi-idioma:** Español, Inglés, Francés  
📱 **Responsive:** Funciona en móvil y desktop  
🤖 **IA Integrada:** Análisis inteligente con Gemini  

---

**¿Necesitas ayuda?** Revisa el archivo `README.md` o `DEPLOYMENT.md` para más información.

