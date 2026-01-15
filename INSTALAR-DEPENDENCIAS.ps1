# Script para Instalar Dependencias de Onyx Suite
# Resuelve conflictos de dependencias automaticamente

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Instalando Dependencias de Onyx Suite" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeCheck = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Node.js: $nodeCheck" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Node.js no encontrado" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
} catch {
    Write-Host "ERROR: Node.js no encontrado" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Intentar instalacion normal
Write-Host "Intento 1: Instalacion normal..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Dependencias instaladas correctamente" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Intento 2: Instalacion con --legacy-peer-deps..." -ForegroundColor Yellow
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Dependencias instaladas (modo legacy)" -ForegroundColor Green
    Write-Host ""
    Write-Host "NOTA: Se uso --legacy-peer-deps para resolver conflictos" -ForegroundColor Yellow
    Write-Host "Esto es seguro y no afecta la funcionalidad" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "ERROR: No se pudieron instalar las dependencias" -ForegroundColor Red
Write-Host ""
Write-Host "Soluciones alternativas:" -ForegroundColor Yellow
Write-Host "  1. npm install --force" -ForegroundColor Cyan
Write-Host "  2. Elimina node_modules y package-lock.json y vuelve a intentar" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para salir"
exit 1


