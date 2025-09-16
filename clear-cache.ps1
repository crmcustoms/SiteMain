# Быстрая очистка всех кешей проекта

Write-Host "=== Очистка кешей проекта ===" -ForegroundColor Green

# Очищаем кеш Next.js
if (Test-Path ".next") {
    Write-Host "Очищаем кеш Next.js..." -ForegroundColor Yellow
    Remove-Item ".next" -Recurse -Force
    Write-Host "✅ Кеш Next.js очищен" -ForegroundColor Green
}

# Очищаем node_modules (опционально, если есть проблемы)
if ($args[0] -eq "--full") {
    if (Test-Path "node_modules") {
        Write-Host "Очищаем node_modules..." -ForegroundColor Yellow
        Remove-Item "node_modules" -Recurse -Force
        Write-Host "✅ node_modules очищен" -ForegroundColor Green
        
        Write-Host "Переустанавливаем зависимости..." -ForegroundColor Yellow
        npm install
        Write-Host "✅ Зависимости переустановлены" -ForegroundColor Green
    }
}

# Очищаем кеш браузера (инструкция)
Write-Host ""
Write-Host "=== Дополнительно ===" -ForegroundColor Cyan
Write-Host "Не забудьте очистить кеш браузера:" -ForegroundColor White
Write-Host "- Chrome/Edge: Ctrl+Shift+R (жесткая перезагрузка)" -ForegroundColor Gray
Write-Host "- Firefox: Ctrl+F5" -ForegroundColor Gray
Write-Host "- Или: F12 -> Network -> Disable cache" -ForegroundColor Gray

Write-Host ""
Write-Host "Кеш очищен! Можете перезапускать сервер." -ForegroundColor Green
Write-Host "Использование: .\clear-cache.ps1 [--full]" -ForegroundColor Gray