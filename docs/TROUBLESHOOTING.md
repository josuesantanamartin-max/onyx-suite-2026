# 🔧 Guía de Solución de Problemas - Onyx Suite 2026

**Versión 1.0** | Última actualización: Febrero 2026

---

## 📋 Tabla de Contenidos

1. [Problemas Comunes](#problemas-comunes)
2. [Errores de Autenticación](#errores-de-autenticación)
3. [Problemas de Importación CSV](#problemas-de-importación-csv)
4. [Errores de IA](#errores-de-ia)
5. [Problemas de Sincronización](#problemas-de-sincronización)
6. [Errores de Backups](#errores-de-backups)
7. [Problemas de Rendimiento](#problemas-de-rendimiento)
8. [Errores del Navegador](#errores-del-navegador)
9. [Diagnóstico Avanzado](#diagnóstico-avanzado)

---

## 🚨 Problemas Comunes

### La aplicación no carga / Pantalla en blanco

**Síntomas:**
- Pantalla blanca después de cargar
- Error "Failed to fetch"
- La app se queda en el logo de carga

**Soluciones:**

1. **Verificar conexión a internet**
   ```bash
   # Prueba de conectividad
   ping google.com
   ```

2. **Limpiar caché del navegador**
   - Chrome: `Ctrl+Shift+Delete` → Seleccionar "Cached images and files"
   - Firefox: `Ctrl+Shift+Delete` → Seleccionar "Cache"
   - Safari: Preferencias → Privacidad → Gestionar datos de sitios web

3. **Modo incógnito**
   - Chrome: `Ctrl+Shift+N`
   - Firefox: `Ctrl+Shift+P`
   - Si funciona en incógnito, el problema es una extensión o caché

4. **Actualizar navegador**
   - Versión mínima requerida:
     - Chrome 90+
     - Firefox 88+
     - Safari 14+
     - Edge 90+

5. **Verificar consola del navegador**
   - Presiona `F12`
   - Ve a la pestaña "Console"
   - Busca errores en rojo
   - Copia el error y contacta soporte

---

### Los datos no se guardan

**Síntomas:**
- Cambios desaparecen al recargar
- Mensaje "Error al guardar"
- Los datos no persisten

**Soluciones:**

1. **Verificar autenticación**
   ```typescript
   // En consola del navegador
   console.log(localStorage.getItem('onyx_user_store'));
   ```
   - Si es `null`, no estás autenticado
   - Cierra sesión y vuelve a iniciar

2. **Verificar espacio en localStorage**
   ```javascript
   // En consola del navegador
   let total = 0;
   for(let key in localStorage) {
       total += localStorage[key].length;
   }
   console.log(`Total: ${(total / 1024).toFixed(2)} KB`);
   ```
   - Límite: ~5-10MB
   - Si está lleno, elimina backups antiguos

3. **Verificar conexión a Supabase**
   - Ve a Configuración → Estado del Sistema
   - Debe mostrar "Conectado"
   - Si no, verifica tu conexión a internet

4. **Revisar permisos del navegador**
   - Asegúrate de que el sitio puede guardar datos
   - Chrome: `chrome://settings/content/all`
   - Busca el dominio de Onyx Suite
   - Permite "Cookies" y "JavaScript"

---

### Widgets del dashboard no se muestran

**Síntomas:**
- Dashboard vacío
- Widgets desaparecen
- Error "Widget not found"

**Soluciones:**

1. **Restaurar layout por defecto**
   - Ve a Configuración → Personalización
   - Haz clic en "Restaurar Diseño Original"
   - Confirma la acción

2. **Verificar modo edición**
   - Asegúrate de no estar en modo edición
   - Botón superior derecho debe decir "Editar"

3. **Limpiar layouts corruptos**
   ```javascript
   // En consola del navegador
   const store = JSON.parse(localStorage.getItem('onyx_user_store'));
   delete store.state.dashboardLayouts;
   localStorage.setItem('onyx_user_store', JSON.stringify(store));
   location.reload();
   ```

---

## 🔐 Errores de Autenticación

### No puedo iniciar sesión

**Error: "Invalid login credentials"**

**Soluciones:**

1. **Verificar credenciales**
   - Email correcto (sin espacios)
   - Contraseña correcta (case-sensitive)
   - Verifica Caps Lock

2. **Recuperar contraseña**
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa tu email
   - Revisa tu bandeja de entrada (y spam)
   - Sigue el enlace de recuperación

3. **Verificar email**
   - Si es cuenta nueva, verifica tu email primero
   - Busca email de "Onyx Suite - Verifica tu cuenta"
   - Haz clic en el enlace de verificación

**Error: "Email not confirmed"**

**Solución:**
```bash
# Reenviar email de verificación
1. Ve a la página de login
2. Haz clic en "Reenviar email de verificación"
3. Ingresa tu email
4. Revisa tu bandeja de entrada
```

---

### Sesión expira constantemente

**Síntomas:**
- Te desloguea cada pocos minutos
- Mensaje "Session expired"

**Soluciones:**

1. **Verificar cookies**
   - Asegúrate de que las cookies estén habilitadas
   - Chrome: `chrome://settings/cookies`
   - Permite cookies de terceros para Supabase

2. **Verificar hora del sistema**
   - Los tokens JWT dependen de la hora
   - Sincroniza la hora de tu sistema
   - Windows: Configuración → Hora e idioma → Sincronizar ahora

3. **Limpiar tokens antiguos**
   ```javascript
   // En consola del navegador
   localStorage.removeItem('supabase.auth.token');
   location.reload();
   ```

---

## 📊 Problemas de Importación CSV

### Error: "Invalid CSV format"

**Causas comunes:**
- Archivo no es CSV
- Codificación incorrecta
- Delimitador incorrecto

**Soluciones:**

1. **Verificar formato del archivo**
   ```csv
   # Formato correcto
   Fecha,Descripción,Monto,Categoría
   01/02/2026,Mercadona,-45.50,Alimentación
   02/02/2026,Salario,2500.00,Ingresos
   ```

2. **Convertir a UTF-8**
   - Abre el CSV en Notepad++
   - Codificación → Convertir a UTF-8
   - Guarda el archivo

3. **Verificar delimitador**
   - Debe ser coma (`,`)
   - Si tu Excel usa punto y coma (`;`):
     - Abre en Excel
     - Guardar como → CSV (delimitado por comas)

---

### Las transacciones se importan con fechas incorrectas

**Problema:**
- Fechas en formato incorrecto
- Mes y día invertidos

**Soluciones:**

1. **Formato de fecha correcto**
   - Usar: `DD/MM/YYYY` (01/02/2026)
   - O: `YYYY-MM-DD` (2026-02-01)
   - Evitar: `MM/DD/YYYY` (formato US)

2. **Configurar formato en Excel**
   ```
   1. Selecciona columna de fechas
   2. Formato de celdas → Personalizado
   3. Tipo: DD/MM/YYYY
   4. Aceptar
   ```

3. **Usar formato ISO**
   - Más confiable: `YYYY-MM-DD`
   - Ejemplo: `2026-02-01`

---

### Categorías no se asignan automáticamente

**Problema:**
- Todas las transacciones quedan sin categoría
- La IA no categoriza

**Soluciones:**

1. **Verificar descripciones**
   - Deben ser descriptivas
   - Mal: "Pago"
   - Bien: "Mercadona - Compra semanal"

2. **Crear reglas de automatización**
   - Ve a Configuración → Automatización
   - Crea reglas para comercios frecuentes
   - Ejemplo: Si contiene "Mercadona" → Alimentación

3. **Categorizar manualmente primero**
   - Categoriza las primeras 10-20 transacciones
   - La IA aprenderá de tus patrones

---

## 🤖 Errores de IA

### Error: "AI service unavailable"

**Causas:**
- Límite de cuota alcanzado
- Servicio de OpenAI caído
- API key inválida

**Soluciones:**

1. **Verificar plan**
   - Plan Básico: 10 generaciones/mes
   - Plan Familia: Ilimitado
   - Ve a Configuración → Suscripción

2. **Esperar y reintentar**
   - Si es problema de OpenAI, espera 5-10 minutos
   - Reintenta la generación

3. **Usar modo manual**
   - Crea recetas manualmente mientras tanto
   - Reporta el error a soporte

---

### Las recetas generadas no tienen sentido

**Problema:**
- Ingredientes extraños
- Instrucciones confusas
- Cantidades incorrectas

**Soluciones:**

1. **Mejorar el prompt**
   - Mal: "pasta"
   - Bien: "Pasta carbonara italiana para 4 personas, con bacon y sin nata"

2. **Especificar restricciones**
   - "Sin gluten"
   - "Vegetariano"
   - "Bajo en calorías"
   - "Con ingredientes de mi despensa"

3. **Regenerar**
   - Haz clic en "Regenerar"
   - Prueba con un prompt diferente

4. **Editar manualmente**
   - Usa la receta generada como base
   - Edita ingredientes e instrucciones

---

## 🔄 Problemas de Sincronización

### Los cambios no se sincronizan entre dispositivos

**Síntomas:**
- Cambios en móvil no aparecen en PC
- Datos desactualizados

**Soluciones:**

1. **Verificar autenticación**
   - Asegúrate de usar la misma cuenta
   - Cierra sesión y vuelve a iniciar en ambos

2. **Forzar sincronización**
   - Recarga la página (`Ctrl+R`)
   - O cierra sesión y vuelve a iniciar

3. **Verificar conexión**
   - Ambos dispositivos deben estar online
   - Verifica conexión a internet

4. **Limpiar caché**
   - En el dispositivo con datos antiguos
   - Limpia caché y recarga

---

### Error: "Sync conflict detected"

**Problema:**
- Editaste el mismo dato en dos dispositivos
- Conflicto de versiones

**Solución:**

1. **Elegir versión**
   - La app mostrará ambas versiones
   - Elige la correcta
   - O combina manualmente

2. **Prevenir conflictos**
   - Espera a que sincronice antes de cambiar de dispositivo
   - Usa un dispositivo a la vez para ediciones importantes

---

## 💾 Errores de Backups

### Error: "Failed to create backup"

**Causas:**
- localStorage lleno
- Demasiados datos
- Permisos del navegador

**Soluciones:**

1. **Liberar espacio**
   ```javascript
   // Eliminar backups antiguos
   1. Ve a Configuración → Backups
   2. Elimina backups antiguos
   3. Intenta crear nuevo backup
   ```

2. **Reducir retención**
   - Configura retención a 3 backups
   - Elimina backups manualmente

3. **Descargar backups importantes**
   - Descarga como JSON
   - Guarda en tu PC
   - Elimina del navegador

---

### No puedo restaurar un backup

**Error: "Restore failed"**

**Soluciones:**

1. **Verificar integridad**
   ```javascript
   // Verificar backup en consola
   const backups = JSON.parse(localStorage.getItem('onyx_local_backups'));
   console.log(backups);
   ```

2. **Intentar con otro backup**
   - Si tienes múltiples backups
   - Prueba con uno más reciente o antiguo

3. **Restaurar manualmente**
   - Descarga el backup como JSON
   - Contacta soporte para ayuda

---

## ⚡ Problemas de Rendimiento

### La aplicación va lenta

**Síntomas:**
- Interfaz se congela
- Respuesta lenta a clicks
- Animaciones entrecortadas

**Soluciones:**

1. **Cerrar pestañas innecesarias**
   - Cada pestaña consume RAM
   - Cierra otras aplicaciones

2. **Limpiar datos antiguos**
   - Elimina transacciones muy antiguas
   - Archiva recetas no usadas
   - Limpia backups antiguos

3. **Desactivar animaciones**
   ```css
   /* En Configuración → Accesibilidad */
   Reducir movimiento: ON
   ```

4. **Actualizar navegador**
   - Usa la última versión
   - Chrome suele ser más rápido

5. **Verificar extensiones**
   - Desactiva extensiones temporalmente
   - Algunas pueden ralentizar la app

---

### Los gráficos no cargan

**Problema:**
- Gráficos en blanco
- Error "Chart failed to render"

**Soluciones:**

1. **Verificar datos**
   - Necesitas al menos 3 transacciones
   - Deben estar en el rango de fechas seleccionado

2. **Cambiar rango de fechas**
   - Amplía el rango
   - Ejemplo: Último mes → Últimos 3 meses

3. **Limpiar caché**
   - Recarga con `Ctrl+Shift+R`

---

## 🌐 Errores del Navegador

### Error: "localStorage is not available"

**Causa:**
- Modo privado/incógnito
- Cookies deshabilitadas
- Extensión bloqueando

**Soluciones:**

1. **Salir de modo incógnito**
   - Usa ventana normal del navegador

2. **Habilitar cookies**
   - Chrome: `chrome://settings/cookies`
   - Permite cookies

3. **Desactivar extensiones**
   - Especialmente bloqueadores de privacidad
   - Privacy Badger, uBlock Origin, etc.

---

### Error: "CORS policy blocked"

**Causa:**
- Problema de configuración de Supabase
- Extensión bloqueando requests

**Soluciones:**

1. **Desactivar extensiones**
   - Especialmente CORS-related

2. **Verificar URL**
   - Asegúrate de estar en el dominio correcto
   - No en `localhost` si es producción

3. **Contactar soporte**
   - Es un problema del servidor
   - Necesita ser resuelto por el equipo

---

## 🔍 Diagnóstico Avanzado

### Obtener logs de error

```javascript
// En consola del navegador (F12)

// 1. Habilitar logs detallados
localStorage.setItem('debug', 'true');

// 2. Reproducir el error

// 3. Copiar logs
console.save = function(data, filename){
    const blob = new Blob([JSON.stringify(data)], {type: 'text/json'});
    const link = document.createElement('a');
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

// 4. Guardar logs
console.save(console.history, 'onyx-logs.json');
```

---

### Verificar estado del sistema

```javascript
// Estado de Supabase
const { data, error } = await supabase.from('transactions').select('count');
console.log('Supabase:', error ? 'Error' : 'OK');

// Estado de localStorage
console.log('localStorage:', typeof localStorage !== 'undefined' ? 'OK' : 'Error');

// Estado de autenticación
const user = supabase.auth.getUser();
console.log('Auth:', user ? 'Logged in' : 'Not logged in');
```

---

### Resetear aplicación completamente

**⚠️ ADVERTENCIA: Esto borrará TODOS tus datos locales**

```javascript
// En consola del navegador
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('supabase-db');
location.reload();
```

Después:
1. Cierra sesión
2. Limpia caché del navegador
3. Reinicia el navegador
4. Inicia sesión de nuevo

---

## 📞 Contactar Soporte

Si ninguna solución funciona:

1. **Recopila información**
   - Navegador y versión
   - Sistema operativo
   - Mensaje de error exacto
   - Pasos para reproducir
   - Capturas de pantalla

2. **Exporta logs**
   ```javascript
   // Ejecuta en consola
   console.save(localStorage, 'onyx-state.json');
   ```

3. **Contacta**
   - Email: support@onyxsuite.com
   - Asunto: "[BUG] Descripción breve"
   - Adjunta logs y capturas

4. **Tiempo de respuesta**
   - Plan Básico: 24-48 horas
   - Plan Familia: 12 horas (prioritario)

---

## 🛠️ Herramientas de Diagnóstico

### Verificador de Sistema

```javascript
// Ejecuta en consola para diagnóstico completo
(async function systemCheck() {
    const results = {
        browser: navigator.userAgent,
        localStorage: typeof localStorage !== 'undefined',
        cookies: navigator.cookieEnabled,
        online: navigator.onLine,
        supabase: null,
        auth: null
    };
    
    try {
        const { data } = await supabase.from('transactions').select('count');
        results.supabase = 'OK';
    } catch (e) {
        results.supabase = e.message;
    }
    
    try {
        const { data } = await supabase.auth.getUser();
        results.auth = data.user ? 'Logged in' : 'Not logged in';
    } catch (e) {
        results.auth = e.message;
    }
    
    console.table(results);
    return results;
})();
```

---

## 📚 Recursos Adicionales

- [Manual de Usuario](./USER_GUIDE.md)
- [Documentación de Arquitectura](./ARCHITECTURE.md)
- [Centro de Ayuda](https://help.onyxsuite.com)
- [Estado del Servicio](https://status.onyxsuite.com)
- [Comunidad Discord](https://discord.gg/onyxsuite)

---

*¿Encontraste un bug? [Repórtalo aquí](https://github.com/onyxsuite/issues)*
