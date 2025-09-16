# Скрипт для очистки кэша и запуска сервера
Write-Host "Остановка процессов Node.js..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null

Write-Host "Очистка директории сборки..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
}

Write-Host "Очистка кэша npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Очистка кэша node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
}

Write-Host "Запуск сборки проекта..." -ForegroundColor Green
npm run build

Write-Host "Запуск сервера..." -ForegroundColor Green
$port = 3004
npx next start -p $port 