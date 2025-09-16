# Скрипт для исправления проблем с изображениями

Write-Host "Fixing image issues..." -ForegroundColor Green

# Очищаем кеш Next.js
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Next.js cache cleaned." -ForegroundColor Green
} else {
    Write-Host "Next.js cache not found." -ForegroundColor Yellow
}

# Проверяем наличие файла-заглушки
Write-Host "Checking placeholder image..." -ForegroundColor Yellow
$placeholderPath = "public/placeholder.jpg"
if (Test-Path $placeholderPath) {
    Write-Host "Placeholder image found." -ForegroundColor Green
} else {
    Write-Host "Placeholder image not found! Creating a default one..." -ForegroundColor Red
    
    # Создаем простую заглушку с текстом "No Image"
    $tempFile = [System.IO.Path]::GetTempFileName()
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile("https://via.placeholder.com/800x600.jpg?text=No+Image", $tempFile)
    
    # Копируем заглушку в нужное место
    Copy-Item -Path $tempFile -Destination $placeholderPath -Force
    Remove-Item -Path $tempFile -Force
    
    Write-Host "Default placeholder image created." -ForegroundColor Green
}

# Создаем директорию для логов
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
    Write-Host "Created logs directory." -ForegroundColor Green
}

# Текущая дата и время для имени файла лога
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/image-fix-$timestamp.log"

Write-Host "Logging to $logFile" -ForegroundColor Yellow

# Устанавливаем переменные окружения для отладки
$env:DEBUG = "app:*"
$env:NEXT_PUBLIC_DEBUG = "true"
$env:NODE_ENV = "development"

# Запускаем сервер
Write-Host "Starting server in development mode..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server when testing is complete." -ForegroundColor Yellow

# Запускаем сервер с выводом в лог-файл
npm run dev > $logFile 2>&1 