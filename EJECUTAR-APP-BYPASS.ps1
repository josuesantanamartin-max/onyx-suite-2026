# 🚀 Script para Ejecutar Onyx Suite (con bypass de política)
# Este script se ejecuta con permisos especiales

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🚀 ONYX SUITE - Inicio Rápido            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0 -and $nodeVersion) {
        Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js no encontrado"
    }
} catch {
    Write-Host "✗ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instala Node.js desde:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Después de instalar Node.js:" -ForegroundColor Yellow
    Write-Host "  1. Cierra y vuelve a abrir PowerShell" -ForegroundColor White
    Write-Host "  2. Ejecuta este script nuevamente" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0 -and $npmVersion) {
        Write-Host "✓ npm encontrado: v$npmVersion" -ForegroundColor Green
    } else {
        throw "npm no encontrado"
    }
} catch {
    Write-Host "✗ npm no está disponible" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""

# Verificar dependencias
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error instalando dependencias" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
    Write-Host ""
}

# Iniciar servidor de desarrollo
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     🎉 Iniciando Onyx Suite...                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "La aplicación se abrirá en:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

# Ejecutar servidor
npm run dev


