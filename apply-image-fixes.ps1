# Скрипт для применения всех исправлений проблем с изображениями

Write-Host "Applying image fixes..." -ForegroundColor Green

# Очистка кеша Next.js
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Next.js cache cleaned." -ForegroundColor Green
} else {
    Write-Host "Next.js cache not found." -ForegroundColor Yellow
}

# Создаем директорию для логов
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
    Write-Host "Created logs directory." -ForegroundColor Green
}

# Текущая дата и время для имени файла лога
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/image-fixes-$timestamp.log"

Write-Host "Logging to $logFile" -ForegroundColor Yellow

# Устанавливаем переменные окружения для отладки
$env:DEBUG = "app:*"
$env:NEXT_PUBLIC_DEBUG = "true"
$env:NODE_ENV = "development"

# Запускаем сервер с перенаправлением вывода в лог-файл
Write-Host "Starting server in development mode with logging..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server when testing is complete." -ForegroundColor Yellow

# Запускаем сервер с выводом в лог-файл
npm run dev > $logFile 2>&1

# Открываем браузер для тестирования
Start-Sleep -Seconds 5
Write-Host "Opening browser for testing..." -ForegroundColor Green
Start-Process "http://localhost:3000/blog" 