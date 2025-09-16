# Скрипт для перезапуска сервера и очистки кеша

Write-Host "Restarting server and clearing cache..." -ForegroundColor Green

# Завершаем все процессы Node.js
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Write-Host "Node.js processes stopped." -ForegroundColor Green

# Очистка кеша Next.js
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Next.js cache cleaned." -ForegroundColor Green
} else {
    Write-Host "Next.js cache not found." -ForegroundColor Yellow
}

# Проверка наличия файла-заглушки
Write-Host "Checking placeholder image..." -ForegroundColor Yellow
$placeholderPath = "public/placeholder.jpg"
if (Test-Path $placeholderPath) {
    Write-Host "Placeholder image found." -ForegroundColor Green
} else {
    Write-Host "Placeholder image not found! Creating a default one..." -ForegroundColor Red
    
    # Создаем директорию public, если она не существует
    if (-not (Test-Path "public")) {
        New-Item -Path "public" -ItemType Directory -Force | Out-Null
        Write-Host "Created public directory." -ForegroundColor Green
    }
    
    # Создаем пустое изображение как заглушку
    $placeholderContent = @"
iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw2AAAAA1BMVEXr6+uInxNMAAAAH0lEQVRo
ge3BMQEAAADCoPVPbQo/oAAAAAAAAAAAABgOcqAAAUWJhY4AAAAASUVORK5CYII=
"@
    
    $bytes = [Convert]::FromBase64String($placeholderContent)
    [System.IO.File]::WriteAllBytes($placeholderPath, $bytes)
    
    Write-Host "Default placeholder image created." -ForegroundColor Green
}

# Создаем директорию для логов
if (-not (Test-Path "logs")) {
    New-Item -Path "logs" -ItemType Directory -Force | Out-Null
    Write-Host "Created logs directory." -ForegroundColor Green
}

# Текущая дата и время для имени файла лога
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/server-$timestamp.log"

Write-Host "Logging to $logFile" -ForegroundColor Yellow

# Запускаем сервер
Write-Host "Starting server..." -ForegroundColor Green
Write-Host "Server will be available at http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow

# Запускаем сервер с выводом в лог-файл
npm run dev > $logFile 2>&1 