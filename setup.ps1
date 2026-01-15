# 🎯 ONYX SUITE - Professional Setup Script (Windows PowerShell)
# Este script configura todo el entorno de desarrollo profesional en Windows

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 ONYX SUITE - Professional Setup v1.0      ║" -ForegroundColor Cyan
Write-Host "║   Configuración Automatizada de Entorno        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

function Info($msg) { Write-Host "ℹ $msg" -ForegroundColor Blue }
function Success($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Warning($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Error($msg) { Write-Host "✗ $msg" -ForegroundColor Red }

# Verificar si estamos en el directorio correcto
if (-Not (Test-Path "package.json")) {
    Error "No se encuentra package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
}

Info "Verificando prerequisitos..."

# Verificar Node.js
try {
    $nodeVersion = node -v
    Success "Node.js $nodeVersion ✓"
} catch {
    Error "Node.js no está instalado. Instala Node.js 18+ desde https://nodejs.org"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm -v
    Success "npm $npmVersion ✓"
} catch {
    Error "npm no está instalado."
    exit 1
}

# Verificar Git
try {
    $gitVersion = git --version
    Success "$gitVersion ✓"
} catch {
    Error "Git no está instalado. Instala Git desde https://git-scm.com"
    exit 1
}

Write-Host ""
Info "═══════════════════════════════════════════════"
Info "  PASO 1: Instalación de Dependencias"
Info "═══════════════════════════════════════════════"

Info "Instalando dependencias del proyecto..."
npm install
if ($LASTEXITCODE -eq 0) {
    Success "Dependencias instaladas correctamente"
} else {
    Error "Error instalando dependencias"
    exit 1
}

Info "Instalando herramientas de desarrollo..."
npm install -D @types/node typescript eslint prettier vitest '@vitest/ui' playwright vite-plugin-pwa workbox-window
if ($LASTEXITCODE -eq 0) {
    Success "Herramientas de desarrollo instaladas"
} else {
    Warning "Algunas herramientas no se instalaron correctamente"
}

Write-Host ""
Info "═══════════════════════════════════════════════"
Info "  PASO 2: Configuración de Archivos"
Info "═══════════════════════════════════════════════"

# Crear .env.local si no existe
if (-Not (Test-Path ".env.local")) {
    Info "Creando archivo .env.local..."
    @"
# 🔑 ONYX SUITE - Environment Variables
# Configuración generada automáticamente

# Gemini AI (Requerido)
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Supabase (Opcional - para sync en la nube)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# App Configuration
VITE_APP_NAME=Onyx Suite
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Success "Archivo .env.local creado"
    Warning "⚠ IMPORTANTE: Edita .env.local y añade tus API keys"
} else {
    Warning ".env.local ya existe, no se sobrescribirá"
}

# Crear .gitignore mejorado si no existe
if (-Not (Test-Path ".gitignore")) {
    Info "Creando .gitignore..."
    @"
# Dependencias
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temp
.cache/
.temp/
.tmp/

# PWA
dev-dist/
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
    Success ".gitignore creado"
} else {
    Info ".gitignore ya existe"
}

Write-Host ""
Info "═══════════════════════════════════════════════"
Info "  PASO 3: Estructura de Directorios"
Info "═══════════════════════════════════════════════"

# Crear directorios necesarios
$dirs = @(
    "public/icons",
    "src/utils",
    "src/hooks",
    "tests/unit",
    "tests/e2e",
    "docs"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Success "Estructura de directorios creada"

Write-Host ""
Info "═══════════════════════════════════════════════"
Info "  PASO 4: Verificación Final"
Info "═══════════════════════════════════════════════"

Info "Ejecutando verificación de TypeScript..."
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Success "TypeScript: Sin errores"
} else {
    Warning "TypeScript: Hay errores de tipo (no crítico)"
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ SETUP COMPLETADO EXITOSAMENTE         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Info "Próximos pasos:"
Write-Host "  1. Edita .env.local con tus API keys"
Write-Host "  2. Ejecuta: npm run dev"
Write-Host "  3. Abre: http://localhost:5173"
Write-Host ""
Info "Comandos disponibles:"
Write-Host "  npm run dev       - Servidor de desarrollo"
Write-Host "  npm run build     - Build de producción"
Write-Host "  npm run preview   - Preview del build"
Write-Host "  npm run test      - Ejecutar tests"
Write-Host "  npm run lint      - Linter"
Write-Host ""
Success "¡Onyx Suite está listo para desarrollo profesional! 🚀"
