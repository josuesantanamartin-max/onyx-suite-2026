# 🔓 Script para Solucionar Política de Ejecución de PowerShell
# Ejecuta este script UNA VEZ para permitir ejecutar scripts

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🔓 Configuración de Política de Ejecución      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar política actual
Write-Host "Política de ejecución actual:" -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy
Write-Host "  $currentPolicy" -ForegroundColor White
Write-Host ""

if ($currentPolicy -eq "RemoteSigned" -or $currentPolicy -eq "Unrestricted") {
    Write-Host "✓ Tu política ya permite ejecutar scripts locales" -ForegroundColor Green
    Write-Host ""
    Write-Host "Puedes ejecutar Onyx Suite con:" -ForegroundColor Cyan
    Write-Host "  .\EJECUTAR-APP.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 0
}

Write-Host "⚠ La política actual no permite ejecutar scripts" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opciones:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Cambiar política para el usuario actual (Recomendado)" -ForegroundColor White
Write-Host "   Permite ejecutar scripts locales de forma segura" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Usar método alternativo (sin cambiar política)" -ForegroundColor White
Write-Host "   Ejecutar con bypass temporal" -ForegroundColor Gray
Write-Host ""

$opcion = Read-Host "Elige una opción (1 o 2)"

if ($opcion -eq "1") {
    Write-Host ""
    Write-Host "Cambiando política a RemoteSigned..." -ForegroundColor Yellow
    
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "✓ Política cambiada exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ahora puedes ejecutar:" -ForegroundColor Cyan
        Write-Host "  .\EJECUTAR-APP.ps1" -ForegroundColor Yellow
    } catch {
        Write-Host "✗ Error cambiando la política" -ForegroundColor Red
        Write-Host "  Intenta ejecutar PowerShell como Administrador" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Para ejecutar sin cambiar la política, usa:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\EJECUTAR-APP.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O ejecuta directamente:" -ForegroundColor Cyan
    Write-Host "  .\EJECUTAR-APP-BYPASS.ps1" -ForegroundColor Yellow
}

Write-Host ""
pause


