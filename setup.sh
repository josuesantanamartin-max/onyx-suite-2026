#!/bin/bash

# 🎯 ONYX SUITE - Professional Setup Script
# Este script configura todo el entorno de desarrollo profesional

echo "╔═══════════════════════════════════════════════════╗"
echo "║   🚀 ONYX SUITE - Professional Setup v1.0      ║"
echo "║   Configuración Automatizada de Entorno        ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mensajes
info() { echo -e "${BLUE}ℹ ${NC}$1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encuentra package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

info "Verificando prerequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado. Instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versión 18+ requerida. Versión actual: $(node -v)"
    exit 1
fi
success "Node.js $(node -v) ✓"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm no está instalado."
    exit 1
fi
success "npm $(npm -v) ✓"

# Verificar Git
if ! command -v git &> /dev/null; then
    error "Git no está instalado. Instala Git desde https://git-scm.com"
    exit 1
fi
success "Git $(git --version | cut -d' ' -f3) ✓"

echo ""
info "═══════════════════════════════════════════════"
info "  PASO 1: Instalación de Dependencias"
info "═══════════════════════════════════════════════"

info "Instalando dependencias del proyecto..."
npm install
if [ $? -eq 0 ]; then
    success "Dependencias instaladas correctamente"
else
    error "Error instalando dependencias"
    exit 1
fi

info "Instalando herramientas de desarrollo..."
npm install -D @types/node typescript eslint prettier vitest @vitest/ui playwright vite-plugin-pwa workbox-window
if [ $? -eq 0 ]; then
    success "Herramientas de desarrollo instaladas"
else
    warning "Algunas herramientas no se instalaron correctamente"
fi

echo ""
info "═══════════════════════════════════════════════"
info "  PASO 2: Configuración de Archivos"
info "═══════════════════════════════════════════════"

# Crear .env.local si no existe
if [ ! -f ".env.local" ]; then
    info "Creando archivo .env.local..."
    cat > .env.local << EOF
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
EOF
    success "Archivo .env.local creado"
    warning "⚠ IMPORTANTE: Edita .env.local y añade tus API keys"
else
    warning ".env.local ya existe, no se sobrescribirá"
fi

# Crear .gitignore mejorado si no existe
if [ ! -f ".gitignore" ]; then
    info "Creando .gitignore..."
    cat > .gitignore << 'EOF'
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
EOF
    success ".gitignore creado"
else
    info ".gitignore ya existe"
fi

echo ""
info "═══════════════════════════════════════════════"
info "  PASO 3: Configuración de Git Hooks"
info "═══════════════════════════════════════════════"

# Instalar husky para git hooks
info "Configurando Git hooks..."
npm install -D husky lint-staged
npx husky install

# Crear hook pre-commit
mkdir -p .husky
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
EOF
chmod +x .husky/pre-commit

success "Git hooks configurados"

echo ""
info "═══════════════════════════════════════════════"
info "  PASO 4: Estructura de Directorios"
info "═══════════════════════════════════════════════"

# Crear directorios necesarios
mkdir -p public/icons
mkdir -p src/utils
mkdir -p src/hooks
mkdir -p tests/unit
mkdir -p tests/e2e
mkdir -p docs

success "Estructura de directorios creada"

echo ""
info "═══════════════════════════════════════════════"
info "  PASO 5: Verificación Final"
info "═══════════════════════════════════════════════"

info "Ejecutando verificación de TypeScript..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    success "TypeScript: Sin errores"
else
    warning "TypeScript: Hay errores de tipo (no crítico)"
fi

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║         ✅ SETUP COMPLETADO EXITOSAMENTE         ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
info "Próximos pasos:"
echo "  1. Edita .env.local con tus API keys"
echo "  2. Ejecuta: npm run dev"
echo "  3. Abre: http://localhost:5173"
echo ""
info "Comandos disponibles:"
echo "  npm run dev       - Servidor de desarrollo"
echo "  npm run build     - Build de producción"
echo "  npm run preview   - Preview del build"
echo "  npm run test      - Ejecutar tests"
echo "  npm run lint      - Linter"
echo ""
success "¡Onyx Suite está listo para desarrollo profesional! 🚀"
