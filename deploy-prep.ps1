# Скрипт для подготовки к публикации
Write-Host "Подготовка проекта к публикации" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green

# Остановка всех процессов Node.js
Write-Host "Остановка процессов Node.js..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null

# Очистка всех временных файлов и кэшей
Write-Host "Очистка временных файлов и кэшей..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
}

if (Test-Path "out") {
    Remove-Item -Recurse -Force out
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
}

# Очистка кэша npm
Write-Host "Очистка кэша npm..." -ForegroundColor Yellow
npm cache clean --force

# Проверка зависимостей
Write-Host "Проверка зависимостей..." -ForegroundColor Yellow
npm ci

# Сборка проекта
Write-Host "Сборка проекта..." -ForegroundColor Green
npm run build

Write-Host "----------------------------" -ForegroundColor Green
Write-Host "Проект готов к публикации!" -ForegroundColor Green
Write-Host "Файлы сборки находятся в директории '.next'" -ForegroundColor Green
Write-Host "Для публикации рекомендуется использовать Vercel или другой хостинг с поддержкой Next.js" -ForegroundColor Green 