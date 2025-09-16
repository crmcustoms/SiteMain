# Скрипт для перезапуска сервера с поддержкой изображений из Notion

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

# Проверка наличия файла заглушки
Write-Host "Проверка наличия файла заглушки..." -ForegroundColor Yellow
if (-not (Test-Path "public/placeholder.jpg")) {
    Write-Host "Файл заглушки не найден! Создаем..." -ForegroundColor Red
    
    # Создаем директорию public, если она не существует
    if (-not (Test-Path "public")) {
        New-Item -Path "public" -ItemType Directory -Force | Out-Null
        Write-Host "Создана директория public." -ForegroundColor Green
    }
    
    # Создаем простое изображение-заглушку
    $placeholderContent = "iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw2AAAAA1BMVEXr6+uInxNMAAAAH0lEQVRoge3BMQEAAADCoPVPbQo/oAAAAAAAAAAAABgOcqAAAUWJhY4AAAAASUVORK5CYII="
    [System.IO.File]::WriteAllBytes("public/placeholder.jpg", [Convert]::FromBase64String($placeholderContent))
    Write-Host "Создан файл заглушки." -ForegroundColor Green
} else {
    Write-Host "Файл заглушки найден." -ForegroundColor Green
}

# Запуск сервера разработки Next.js
Write-Host "Запуск сервера разработки Next.js..." -ForegroundColor Yellow
Write-Host "Сервер будет доступен по адресу http://localhost:3000" -ForegroundColor Green
Write-Host "Для остановки сервера нажмите Ctrl+C" -ForegroundColor Yellow

# Запускаем сервер разработки
npm run dev 