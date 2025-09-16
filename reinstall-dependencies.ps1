# Скрипт для полной переустановки зависимостей

Write-Host "Полная переустановка зависимостей..." -ForegroundColor Green

# Завершаем все процессы Node.js
Write-Host "Останавливаем все процессы Node.js..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Write-Host "Процессы Node.js остановлены." -ForegroundColor Green

# Очистка кеша Next.js
Write-Host "Очищаем кеш Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "Кеш Next.js очищен." -ForegroundColor Green
} else {
    Write-Host "Кеш Next.js не найден." -ForegroundColor Yellow
}

# Удаляем node_modules
Write-Host "Удаляем node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    # Пробуем удалить обычным способом
    try {
        Remove-Item -Recurse -Force "node_modules" -ErrorAction Stop
        Write-Host "node_modules удалены." -ForegroundColor Green
    } catch {
        Write-Host "Не удалось удалить node_modules обычным способом. Пробуем альтернативный метод..." -ForegroundColor Red
        
        # Пробуем использовать rimraf
        Write-Host "Пробуем использовать rimraf..." -ForegroundColor Yellow
        npm install rimraf -g
        rimraf node_modules
        
        # Проверяем, удалось ли удалить
        if (Test-Path "node_modules") {
            Write-Host "Не удалось удалить node_modules. Попробуйте закрыть все программы, использующие файлы в этой директории, и запустить скрипт снова." -ForegroundColor Red
            Write-Host "Или запустите PowerShell от имени администратора и выполните этот скрипт." -ForegroundColor Red
            exit 1
        } else {
            Write-Host "node_modules удалены с помощью rimraf." -ForegroundColor Green
        }
    }
} else {
    Write-Host "node_modules не найдены." -ForegroundColor Yellow
}

# Удаляем package-lock.json
Write-Host "Удаляем package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "package-lock.json удален." -ForegroundColor Green
} else {
    Write-Host "package-lock.json не найден." -ForegroundColor Yellow
}

# Устанавливаем зависимости заново
Write-Host "Устанавливаем зависимости заново..." -ForegroundColor Green
npm install

# Проверяем успешность установки
if ($LASTEXITCODE -eq 0) {
    Write-Host "Зависимости успешно установлены." -ForegroundColor Green
    
    # Запускаем сборку
    Write-Host "Запускаем сборку проекта..." -ForegroundColor Green
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Проект успешно собран." -ForegroundColor Green
        Write-Host "Теперь можно запустить сервер командой: npm run dev" -ForegroundColor Green
    } else {
        Write-Host "Ошибка при сборке проекта." -ForegroundColor Red
    }
} else {
    Write-Host "Ошибка при установке зависимостей." -ForegroundColor Red
} 