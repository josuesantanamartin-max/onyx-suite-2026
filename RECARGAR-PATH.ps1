# 🔄 Script para Recargar Variables de Entorno en PowerShell
# Útil después de instalar Node.js

Write-Host "🔄 Recargando variables de entorno..." -ForegroundColor Cyan
Write-Host ""

# Recargar variables de entorno del sistema
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "✓ Variables de entorno recargadas" -ForegroundColor Green
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js aún no está disponible" -ForegroundColor Red
        Write-Host ""
        Write-Host "Solución:" -ForegroundColor Yellow
        Write-Host "  1. Cierra esta ventana de PowerShell completamente" -ForegroundColor White
        Write-Host "  2. Abre una nueva ventana de PowerShell" -ForegroundColor White
        Write-Host "  3. Vuelve a intentar" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Node.js no está disponible" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, cierra y vuelve a abrir PowerShell" -ForegroundColor Yellow
}

Write-Host ""

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ npm encontrado: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ npm aún no está disponible" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ npm no está disponible" -ForegroundColor Red
}

Write-Host ""


