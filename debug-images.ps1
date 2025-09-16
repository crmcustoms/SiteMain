# Скрипт для запуска сервера в режиме отладки с включенным логированием

Write-Host "Starting server in debug mode..." -ForegroundColor Green

# Устанавливаем переменные окружения для отладки
$env:DEBUG = "app:*"
$env:NEXT_PUBLIC_DEBUG = "true"
$env:NODE_ENV = "development"

# Запускаем сервер
npm run dev 