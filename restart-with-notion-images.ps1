# Скрипт для перезапуска сервера с исправлением проблем с изображениями из Notion

Write-Host "Останавливаем все процессы Node.js..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Write-Host "Все процессы Node.js остановлены." -ForegroundColor Green

# Очистка кеша Next.js
Write-Host "Очистка кеша Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Кеш Next.js очищен." -ForegroundColor Green
} else {
    Write-Host "Кеш Next.js не найден." -ForegroundColor Green
}

# Создаем директорию кеша для S3-прокси
Write-Host "Проверка директории кеша для S3-прокси..." -ForegroundColor Yellow
if (-not (Test-Path ".s3-cache")) {
    New-Item -Path ".s3-cache" -ItemType Directory -Force | Out-Null
    Write-Host "Создана директория кеша для S3-прокси." -ForegroundColor Green
} else {
    Write-Host "Директория кеша для S3-прокси существует." -ForegroundColor Green
}

# Проверка наличия файла заглушки
Write-Host "Проверка наличия файла заглушки..." -ForegroundColor Yellow
if (-not (Test-Path "public/placeholder.jpg")) {
    Write-Host "Файл заглушки не найден! Создаем заглушку..." -ForegroundColor Red
    
    # Создаем директорию public, если она не существует
    if (-not (Test-Path "public")) {
        New-Item -Path "public" -ItemType Directory -Force | Out-Null
        Write-Host "Создана директория public." -ForegroundColor Green
    }
    
    # Создаем пустое изображение как заглушку
    $placeholderContent = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    [System.IO.File]::WriteAllBytes("public/placeholder.jpg", [Convert]::FromBase64String($placeholderContent))
    Write-Host "Заглушка создана." -ForegroundColor Green
} else {
    Write-Host "Файл заглушки найден." -ForegroundColor Green
}

# Проверка наличия необходимых модулей
Write-Host "Проверка наличия необходимых модулей..." -ForegroundColor Yellow
$nodeModulesPath = "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Директория node_modules не найдена! Устанавливаем зависимости..." -ForegroundColor Red
    npm install
    Write-Host "Зависимости установлены." -ForegroundColor Green
} else {
    Write-Host "Директория node_modules существует." -ForegroundColor Green
}

# Запуск сервера разработки Next.js
Write-Host "Запуск сервера разработки Next.js..." -ForegroundColor Yellow
Write-Host "Для остановки сервера нажмите Ctrl+C" -ForegroundColor Yellow

npm run dev 