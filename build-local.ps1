# Скрипт для локальной сборки проекта Next.js
Write-Host "Начинаем локальную сборку проекта..." -ForegroundColor Green

# Установка зависимостей (если необходимо)
Write-Host "Установка зависимостей..." -ForegroundColor Yellow
npm install

# Запуск сборки
Write-Host "Запуск сборки проекта..." -ForegroundColor Yellow
npm run build

# Проверка результата сборки
if ($LASTEXITCODE -eq 0) {
    Write-Host "Сборка успешно завершена!" -ForegroundColor Green
    Write-Host "Для запуска сервера выполните: npm run start" -ForegroundColor Cyan
} else {
    Write-Host "При сборке возникли ошибки. Проверьте логи выше." -ForegroundColor Red
} 