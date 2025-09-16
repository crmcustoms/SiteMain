# Скрипт для локального тестирования Docker сборки перед деплоем

Write-Host "=== Локальное тестирование Docker сборки ===" -ForegroundColor Green

# Проверяем, установлен ли Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker не установлен. Установите Docker Desktop." -ForegroundColor Red
    exit 1
}

# Проверяем, запущен ли Docker
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker не запущен. Запустите Docker Desktop." -ForegroundColor Red
    exit 1
}

$imageName = "sitemain-test"
$containerName = "sitemain-test-container"

Write-Host ""
Write-Host "🧹 Очистка предыдущих тестовых контейнеров..." -ForegroundColor Yellow
docker stop $containerName 2>$null | Out-Null
docker rm $containerName 2>$null | Out-Null
docker rmi $imageName 2>$null | Out-Null

Write-Host "🔧 Сборка Docker образа..." -ForegroundColor Yellow
Write-Host "Это может занять несколько минут при первой сборке..." -ForegroundColor Gray

$buildStart = Get-Date
docker build -t $imageName .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при сборке Docker образа" -ForegroundColor Red
    exit 1
}

$buildTime = ((Get-Date) - $buildStart).TotalSeconds
Write-Host "✅ Образ собран за $([math]::Round($buildTime, 1)) секунд" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Запуск контейнера..." -ForegroundColor Yellow
docker run -d --name $containerName -p 3001:3000 $imageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при запуске контейнера" -ForegroundColor Red
    exit 1
}

Write-Host "⏱️ Ожидание запуска приложения..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Проверяем health check
$maxAttempts = 12
$attempt = 0

do {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Приложение запущено успешно!" -ForegroundColor Green
            break
        }
    } catch {
        if ($attempt -eq $maxAttempts) {
            Write-Host "❌ Приложение не отвечает на health check" -ForegroundColor Red
            Write-Host "Логи контейнера:" -ForegroundColor Yellow
            docker logs $containerName
            docker stop $containerName | Out-Null
            docker rm $containerName | Out-Null
            exit 1
        }
        Write-Host "⏳ Попытка $attempt из $maxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
} while ($attempt -lt $maxAttempts)

Write-Host ""
Write-Host "🌐 Тестирование доступности..." -ForegroundColor Yellow

# Тестируем основные страницы
$testPages = @(
    @{ url = "http://localhost:3001"; name = "Главная страница" },
    @{ url = "http://localhost:3001/api/health"; name = "Health check" },
    @{ url = "http://localhost:3001/uk"; name = "Украинская версия" },
    @{ url = "http://localhost:3001/uk/blog"; name = "Блог" }
)

$allTestsPassed = $true

foreach ($test in $testPages) {
    try {
        $response = Invoke-WebRequest -Uri $test.url -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $($test.name)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($test.name) - статус $($response.StatusCode)" -ForegroundColor Red
            $allTestsPassed = $false
        }
    } catch {
        Write-Host "  ❌ $($test.name) - ошибка: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }
}

Write-Host ""
if ($allTestsPassed) {
    Write-Host "🎉 Все тесты прошли успешно!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Доступные URL:" -ForegroundColor Cyan
    Write-Host "  Приложение: http://localhost:3001" -ForegroundColor White
    Write-Host "  Health check: http://localhost:3001/api/health" -ForegroundColor White
    Write-Host ""
    Write-Host "⚡ Готово к деплою! Используйте:" -ForegroundColor Yellow
    Write-Host "  .\deploy-to-github.ps1 'Описание изменений'" -ForegroundColor White
} else {
    Write-Host "❌ Некоторые тесты не прошли. Проверьте приложение." -ForegroundColor Red
}

Write-Host ""
Write-Host "🧹 Очистка тестовых ресурсов..." -ForegroundColor Yellow
$cleanup = Read-Host "Остановить и удалить тестовый контейнер? (y/N)"

if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    docker stop $containerName | Out-Null
    docker rm $containerName | Out-Null
    docker rmi $imageName | Out-Null
    Write-Host "✅ Очистка завершена" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Контейнер оставлен для дальнейшего тестирования" -ForegroundColor Gray
    Write-Host "Для остановки: docker stop $containerName" -ForegroundColor Gray
    Write-Host "Для удаления: docker rm $containerName && docker rmi $imageName" -ForegroundColor Gray
}