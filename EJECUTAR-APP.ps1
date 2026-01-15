# Script para Ejecutar Onyx Suite
# Ejecuta este script desde PowerShell en el directorio del proyecto

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ONYX SUITE - Inicio Rapido" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
$nodeCheck = $null
try {
    $nodeCheck = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Node.js encontrado: $nodeCheck" -ForegroundColor Green
    } else {
        throw "Node.js no encontrado"
    }
} catch {
    Write-Host "ERROR: Node.js no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instala Node.js desde:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Despues de instalar Node.js:" -ForegroundColor Yellow
    Write-Host "  1. Cierra y vuelve a abrir PowerShell" -ForegroundColor White
    Write-Host "  2. Ejecuta este script nuevamente" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
$npmCheck = $null
try {
    $npmCheck = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK npm encontrado: v$npmCheck" -ForegroundColor Green
    } else {
        throw "npm no encontrado"
    }
} catch {
    Write-Host "ERROR: npm no esta disponible" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Verificar dependencias
if (-Not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Intento con --legacy-peer-deps..." -ForegroundColor Yellow
        npm install --legacy-peer-deps
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Error instalando dependencias" -ForegroundColor Red
            Write-Host ""
            Write-Host "Intenta ejecutar manualmente:" -ForegroundColor Yellow
            Write-Host "  npm install --legacy-peer-deps" -ForegroundColor Cyan
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    }
    Write-Host "OK Dependencias instaladas" -ForegroundColor Green
    Write-Host ""
}

# Iniciar servidor de desarrollo
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Iniciando Onyx Suite..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "La aplicacion se abrira en:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

# Ejecutar servidor
npm run dev
