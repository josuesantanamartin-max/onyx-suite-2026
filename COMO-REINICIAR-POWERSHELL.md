# 🔄 Cómo Reiniciar PowerShell - Guía Visual

## ¿Por qué necesitas reiniciar PowerShell?

Cuando instalas Node.js, se añade automáticamente al **PATH** del sistema. Sin embargo, las ventanas de PowerShell que ya estaban abiertas **no detectan estos cambios automáticamente**.

---

## ✅ Método 1: Cerrar y Abrir (MÁS FÁCIL)

### Paso a Paso:

1. **Cierra la ventana de PowerShell actual**
   - Haz clic en la **X** en la esquina superior derecha
   - O presiona `Alt + F4`
   - O escribe `exit` y presiona Enter

2. **Abre una nueva ventana de PowerShell**
   
   **Opción A - Desde el Menú Inicio:**
   - Presiona `Windows + S`
   - Escribe "PowerShell"
   - Haz clic en "Windows PowerShell" o "PowerShell"

   **Opción B - Desde el Explorador de Archivos:**
   - Navega al directorio del proyecto
   - Haz clic derecho en el espacio vacío
   - Selecciona "Abrir en Terminal" o "Abrir PowerShell aquí"

   **Opción C - Desde la Barra de Tareas:**
   - Si tienes PowerShell anclado, haz clic en el icono

3. **Navega al directorio del proyecto:**
   ```powershell
   cd "D:\Users\Josué\Desktop\Onyx-Suite-main\Onyx-Suite-main"
   ```

4. **Verifica que Node.js funciona:**
   ```powershell
   node --version
   npm --version
   ```

   Si ves números de versión (ej: `v20.10.0`), ¡está funcionando! ✅

---

## 🔄 Método 2: Recargar PATH sin Cerrar

Si no quieres cerrar PowerShell, puedes recargar las variables de entorno:

### Opción A - Usar el Script Incluido:

```powershell
.\RECARGAR-PATH.ps1
```

### Opción B - Comando Manual:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Luego verifica:
```powershell
node --version
```

**Nota:** Este método a veces no funciona si Node.js se instaló mientras PowerShell estaba abierto. En ese caso, usa el Método 1.

---

## 🎯 Verificación Rápida

Después de reiniciar, ejecuta estos comandos para verificar:

```powershell
# Verificar Node.js
node --version
# Debería mostrar algo como: v20.10.0

# Verificar npm
npm --version
# Debería mostrar algo como: 10.2.3

# Verificar que estás en el directorio correcto
Get-Location
# Debería mostrar la ruta a Onyx-Suite-main
```

---

## ❓ Problemas Comunes

### "node no se reconoce" después de reiniciar

**Posibles causas:**
1. Node.js no se instaló correctamente
2. No reiniciaste PowerShell
3. Node.js no se añadió al PATH

**Solución:**
1. Verifica que Node.js esté instalado:
   - Abre "Agregar o quitar programas" en Windows
   - Busca "Node.js"
   - Si no aparece, reinstala desde nodejs.org

2. Verifica el PATH manualmente:
   ```powershell
   $env:Path -split ';' | Select-String "node"
   ```
   Debería mostrar una ruta como: `C:\Program Files\nodejs\`

3. Si no aparece, reinstala Node.js y marca la opción "Add to PATH" durante la instalación

### PowerShell se abre en otro directorio

**Solución:**
```powershell
# Navega al directorio del proyecto
cd "D:\Users\Josué\Desktop\Onyx-Suite-main\Onyx-Suite-main"

# O usa la ruta corta si hay problemas con caracteres especiales
cd D:\Users\Josu*\Desktop\Onyx-Suite-main\Onyx-Suite-main
```

---

## 💡 Consejos

- **Siempre reinicia PowerShell** después de instalar programas que modifican el PATH
- Si tienes múltiples ventanas de PowerShell abiertas, ciérralas todas
- Usa el script `EJECUTAR-APP.ps1` que verifica automáticamente si Node.js está disponible

---

## 🚀 Siguiente Paso

Una vez que Node.js esté funcionando, ejecuta:

```powershell
.\EJECUTAR-APP.ps1
```

O manualmente:
```powershell
npm install
npm run dev
```

¡Y listo! Onyx Suite estará corriendo en http://localhost:3000 🎉


