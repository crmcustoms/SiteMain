# Скрипт для тестирования исправлений проблем с изображениями в блоге

Write-Host "Testing blog image fixes..." -ForegroundColor Green

# Текущая дата и время для имени файла лога
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/blog-test-$timestamp.log"

# Создаем директорию для логов, если она не существует
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
    Write-Host "Created logs directory." -ForegroundColor Green
}

Write-Host "Logging to $logFile" -ForegroundColor Yellow

# Устанавливаем переменные окружения для отладки
$env:DEBUG = "app:*"
$env:NEXT_PUBLIC_DEBUG = "true"
$env:NODE_ENV = "development"

# Запускаем сервер с перенаправлением вывода в лог-файл
Write-Host "Starting server in development mode with enhanced logging..." -ForegroundColor Green
Write-Host "This will help diagnose any remaining image issues." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server when testing is complete." -ForegroundColor Yellow

# Запускаем сервер с расширенным логированием
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow | Out-File -FilePath $logFile

# Даем серверу время на запуск
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Открываем браузер для тестирования блога и кейсов
Write-Host "Opening browser for testing..." -ForegroundColor Green
Start-Process "http://localhost:3000/blog"

# Инструкции для тестирования
Write-Host "`nTest Instructions:" -ForegroundColor Cyan
Write-Host "1. Check if blog cover images are loading correctly" -ForegroundColor White
Write-Host "2. Click on a blog post to check if internal images are loading" -ForegroundColor White
Write-Host "3. Navigate to /cases to test case studies images" -ForegroundColor White
Write-Host "4. Check the log file for any errors: $logFile" -ForegroundColor White
Write-Host "`nWhen finished testing, press Ctrl+C to stop the server." -ForegroundColor Yellow 