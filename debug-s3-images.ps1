# Скрипт для отладки проблем с изображениями из S3
# Запускает сервер в режиме отладки и настраивает логирование

# Устанавливаем цвета для вывода
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red
$Cyan = [ConsoleColor]::Cyan

# Функция для вывода сообщений
function Write-ColorMessage {
    param (
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    
    Write-Host $Message -ForegroundColor $Color
}

# Проверяем, что мы находимся в корне проекта
if (-not (Test-Path "package.json")) {
    Write-ColorMessage "Ошибка: Скрипт должен быть запущен из корня проекта!" $Red
    exit 1
}

# Выводим информацию о запуске
Write-ColorMessage "=== Запуск отладки проблем с изображениями S3 ===" $Cyan
Write-ColorMessage "Подготовка окружения..." $Yellow

# Очищаем кеш Next.js
Write-ColorMessage "Очистка кеша Next.js..." $Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

# Устанавливаем переменные окружения для отладки
$env:DEBUG = "true"
$env:NODE_ENV = "development"
$env:DEBUG_S3_PROXY = "true"

# Создаем тестовую страницу для проверки разных URL форматов
$testPageContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S3 Image Debug Page</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .image-container { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .image-container h2 { margin-top: 0; }
        .image-info { margin-bottom: 10px; font-family: monospace; background: #f5f5f5; padding: 10px; overflow-wrap: break-word; }
        img { max-width: 100%; height: auto; display: block; margin: 10px 0; border: 1px dashed #ccc; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Тестовая страница для отладки изображений S3</h1>
    
    <div class="image-container">
        <h2>Прямая ссылка на S3 (us-east-1)</h2>
        <div class="image-info">URL: https://s3.us-east-1.amazonaws.com/crmcustoms.site/test-image.jpg</div>
        <img src="https://s3.us-east-1.amazonaws.com/crmcustoms.site/test-image.jpg" alt="Test Image Direct" onerror="this.onerror=null; this.insertAdjacentHTML('afterend', '<p class=\'error\'>Ошибка загрузки!</p>');" onload="this.insertAdjacentHTML('afterend', '<p class=\'success\'>Успешно загружено!</p>');">
    </div>
    
    <div class="image-container">
        <h2>Через прокси API (us-east-1)</h2>
        <div class="image-info">URL: /api/s3-proxy/https%3A%2F%2Fs3.us-east-1.amazonaws.com%2Fcrmcustoms.site%2Ftest-image.jpg</div>
        <img src="/api/s3-proxy/https%3A%2F%2Fs3.us-east-1.amazonaws.com%2Fcrmcustoms.site%2Ftest-image.jpg" alt="Test Image Proxy" onerror="this.onerror=null; this.insertAdjacentHTML('afterend', '<p class=\'error\'>Ошибка загрузки!</p>');" onload="this.insertAdjacentHTML('afterend', '<p class=\'success\'>Успешно загружено!</p>');">
    </div>
    
    <div class="image-container">
        <h2>Прямая ссылка на S3 (us-west-2)</h2>
        <div class="image-info">URL: https://s3.us-west-2.amazonaws.com/crmcustoms.site/test-image.jpg</div>
        <img src="https://s3.us-west-2.amazonaws.com/crmcustoms.site/test-image.jpg" alt="Test Image Direct West" onerror="this.onerror=null; this.insertAdjacentHTML('afterend', '<p class=\'error\'>Ошибка загрузки!</p>');" onload="this.insertAdjacentHTML('afterend', '<p class=\'success\'>Успешно загружено!</p>');">
    </div>
    
    <div class="image-container">
        <h2>Через прокси API (us-west-2)</h2>
        <div class="image-info">URL: /api/s3-proxy/https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fcrmcustoms.site%2Ftest-image.jpg</div>
        <img src="/api/s3-proxy/https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fcrmcustoms.site%2Ftest-image.jpg" alt="Test Image Proxy West" onerror="this.onerror=null; this.insertAdjacentHTML('afterend', '<p class=\'error\'>Ошибка загрузки!</p>');" onload="this.insertAdjacentHTML('afterend', '<p class=\'success\'>Успешно загружено!</p>');">
    </div>
    
    <div class="image-container">
        <h2>Ссылка с параметрами безопасности</h2>
        <div class="image-info">URL: /api/s3-proxy/https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fcrmcustoms.site%2Ftest-image.jpg%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential...</div>
        <img src="/api/s3-proxy/https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fcrmcustoms.site%2Ftest-image.jpg%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DASIAZI2LB466VDHCC7NV%252F20250710%252Fus-west-2%252Fs3%252Faws4_request%26X-Amz-Date%3D20250710T134442Z%26X-Amz-Expires%3D3600%26X-Amz-Security-Token%3DIQoJb3JpZ2luX2VjELX%252F%252F%252F%252F%252F%252F%252F%252F%252F%252FwEaCXVzLXdlc3QtMiJIMEYCIQChu1ZMpe9HMqtMtDL76N8IKbK3lmW%252B6InS8N5h0IlHYQIhAIO4F0S8GJJeWD6TGKzsI95%252FEzpDs%252FwIRkwMo%252F%252Fb0Di9KogECL3%252F%252F%252F%252F%252F%252F%252F%252F%252F%252FwEQABoMNjM3NDIzMTgzODA1IgxG5BBNBfDE7lij3tEq3ANeJ0ysD5oI%252B8SfSXKu%252F0q%252BkYJnQcjIwXvjwdVLJmgc7sF7SKx8Q85eWtDi3JFFqre%252BkMibQ2bRRFVN3e3APoNTe0roQFLrfpDXnEAU9FP71xwPCY3k0fmCQXFUhGoANucpSRWAlOFbRxY4R9Sa2yW0geqoiLrHZc05tsFlHyQ9dQIRzkyyD7FYcNzjBc9Fk%252F89nNWb8Wzgfm4hSw5oD4cJ9f5zArJrKTVqC3N1MPhEnYs0ZoZOda3Z88vthxi%252BzamqqxaHcZra97uNA%252BTduCG%252F4moc418P0lq3V4EeEW3VMAdzCnp%252BBP9Y7a8Xm6XtzutPXYZ5TwlS0DrP6EzSRXuxsrXFSLTrKasIOtyKLFdfTrOOdbOaCbaMkIIJOxw36cRzTe%252BoyJmMT6PohVeDpf7qn5axIBvWOCJwAE6HDNScVFIV7EJbp%252BI0s9a99wlN%252FpI0NmQ%252FPqk3GX%252FS4xJvNnjn6lxtXgH6CvuOKLKKID8q93rMer4WhnmxNxhHess63IxGOFISr9RN2Rzh8qjnyDxUNApNPfcUpRwRh679I1Oyqq%252BOTtoOwMdBrqc8OFWjD9ScP%252BFmVPb0JIKC4S0TljhyWbDf5O599xBdo7Xec5%252BKMLvK2qsqVnOF5WJOpjDk4b7DBjqkATNQ5LE1D6E2LSl4UC%252FjFba6R8C1eBFIsNJdeAtmiSd9KvP2m8h7MhTNzN5CnwGxaSOn%252B8mkBQjdRlUlDk80o1b%252BMAbsZJZvmz0Tw4sxFW3S1xiCATDWdirU1pnZmPoJvaCQSKCf9PAqqeOve0F9%252BcDvolEZqD2tnFHaAF9kpEAmdkp0SbnSIDPGbJhfgeTah6J7DMAbapJFljICnm%252FexJrTQbAM%26X-Amz-Signature%3D2992b1f9b94921cb0e61409d0f99a92c8cab77992deb325849675d0bdc7b6e62%26X-Amz-SignedHeaders%3Dhost%26x-amz-checksum-mode%3DENABLED%26x-id%3DGetObject" alt="Test Image with Security Params" onerror="this.onerror=null; this.insertAdjacentHTML('afterend', '<p class=\'error\'>Ошибка загрузки!</p>');" onload="this.insertAdjacentHTML('afterend', '<p class=\'success\'>Успешно загружено!</p>');">
    </div>
</body>
</html>
"@

# Создаем директорию для тестовых файлов, если её нет
if (-not (Test-Path "public/debug")) {
    New-Item -ItemType Directory -Path "public/debug" -Force | Out-Null
}

# Сохраняем тестовую страницу
$testPageContent | Out-File -FilePath "public/debug/s3-test.html" -Encoding utf8

Write-ColorMessage "Тестовая страница создана: /debug/s3-test.html" $Green

# Запускаем сервер в режиме разработки
Write-ColorMessage "Запуск сервера в режиме отладки..." $Green
Write-ColorMessage "После запуска сервера откройте: http://localhost:3000/debug/s3-test.html" $Cyan
Write-ColorMessage "Нажмите Ctrl+C для остановки сервера" $Yellow

# Запускаем сервер
npm run dev 