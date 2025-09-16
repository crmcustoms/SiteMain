# Запуск сервера с отключенным кешем для тестирования нового контента

Write-Host "=== Запуск с отключенным кешем ===" -ForegroundColor Green

# Устанавливаем переменную окружения для отключения кеша
$env:DISABLE_BLOG_CACHE = "true"

Write-Host "✅ Кеш блога отключен (DISABLE_BLOG_CACHE=true)" -ForegroundColor Yellow
Write-Host "Запускаем сервер разработки..." -ForegroundColor Green

# Запускаем сервер с отключенным кешем
npm run dev