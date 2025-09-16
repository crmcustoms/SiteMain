# Скрипт для создания тестовой HTML-страницы с изображениями из S3
# Создает тестовую HTML-страницу с различными вариантами URL изображений из S3

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

# Выводим заголовок
Write-ColorMessage "=== Создание тестовой HTML-страницы с изображениями из S3 ===" $Cyan
Write-ColorMessage "Эта утилита создает тестовую HTML-страницу с различными вариантами URL изображений из S3" $Yellow
Write-ColorMessage "для отладки проблем с загрузкой изображений." $Yellow
Write-ColorMessage ""

# Запрашиваем у пользователя URL изображения для тестирования
Write-ColorMessage "Введите URL изображения из S3 для тестирования (или нажмите Enter для использования тестового URL):" $Cyan
$userUrl = Read-Host

if ([string]::IsNullOrWhiteSpace($userUrl)) {
    # Тестовый URL
    $userUrl = "https://s3.us-west-2.amazonaws.com/crmcustoms.site/test-image.jpg"
    Write-ColorMessage "Используется тестовый URL: $userUrl" $Yellow
}

# Запрашиваем у пользователя URL изображения с параметрами безопасности
Write-ColorMessage "`nВведите URL изображения с параметрами безопасности (или нажмите Enter для пропуска):" $Cyan
$secureUrl = Read-Host

if ([string]::IsNullOrWhiteSpace($secureUrl)) {
    # Тестовый URL с параметрами безопасности
    $secureUrl = "https://s3.us-west-2.amazonaws.com/crmcustoms.site/test-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VDHCC7NV%2F20250710%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250710T134442Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQChu1ZMpe9HMqtMtDL76N8IKbK3lmW%2B6InS8N5h0IlHYQIhAIO4F0S8GJJeWD6TGKzsI95%2FEzpDs%2FwIRkwMo%2F%2Fb0Di9KogECL3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgxG5BBNBfDE7lij3tEq3ANeJ0ysD5oI%2B8SfSXKu%2F0q%2BkYJnQcjIwXvjwdVLJmgc7sF7SKx8Q85eWtDi3JFFqre%2BkMibQ2bRRFVN3e3APoNTe0roQFLrfpDXnEAU9FP71xwPCY3k0fmCQXFUhGoANucpSRWAlOFbRxY4R9Sa2yW0geqoiLrHZc05tsFlHyQ9dQIRzkyyD7FYcNzjBc9Fk%2F89nNWb8Wzgfm4hSw5oD4cJ9f5zArJrKTVqC3N1MPhEnYs0ZoZOda3Z88vthxi%2BzamqqxaHcZra97uNA%2BTduCG%2F4moc418P0lq3V4EeEW3VMAdzCnp%2BBP9Y7a8Xm6XtzutPXYZ5TwlS0DrP6EzSRXuxsrXFSLTrKasIOtyKLFdfTrOOdbOaCbaMkIIJOxw36cRzTe%2BoyJmMT6PohVeDpf7qn5axIBvWOCJwAE6HDNScVFIV7EJbp%2BI0s9a99wlN%2FpI0NmQ%2FPqk3GX%2FS4xJvNnjn6lxtXgH6CvuOKLKKID8q93rMer4WhnmxNxhHess63IxGOFISr9RN2Rzh8qjnyDxUNApNPfcUpRwRh679I1Oyqq%2BOTtoOwMdBrqc8OFWjD9ScP%2BFmVPb0JIKC4S0TljhyWbDf5O599xBdo7Xec5%2BKMLvK2qsqVnOF5WJOpjDk4b7DBjqkATNQ5LE1D6E2LSl4UC%2FjFba6R8C1eBFIsNJdeAtmiSd9KvP2m8h7MhTNzN5CnwGxaSOn%2B8mkBQjdRlUlDk80o1b%2BMAbsZJZvmz0Tw4sxFW3S1xiCATDWdirU1pnZmPoJvaCQSKCf9PAqqeOve0F9%2BcDvolEZqD2tnFHaAF9kpEAmdkp0SbnSIDPGbJhfgeTah6J7DMAbapJFljICnm%2FexJrTQbAM&X-Amz-Signature=2992b1f9b94921cb0e61409d0f99a92c8cab77992deb325849675d0bdc7b6e62&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
    Write-ColorMessage "Используется тестовый URL с параметрами безопасности" $Yellow
}

# Кодируем URL для использования в прокси API
function Encode-Url {
    param (
        [string]$Url
    )
    
    # Проверяем наличие System.Web.HttpUtility
    if (-not ([System.Management.Automation.PSTypeName]'System.Web.HttpUtility').Type) {
        Add-Type -AssemblyName System.Web
    }
    
    return [System.Web.HttpUtility]::UrlEncode($Url)
}

$encodedUrl = Encode-Url -Url $userUrl
$encodedSecureUrl = Encode-Url -Url $secureUrl

# Создаем HTML-контент
$htmlContent = @"
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тестовая страница изображений S3</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .test-section { margin-bottom: 40px; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
        .test-case { margin-bottom: 30px; border-bottom: 1px dashed #ccc; padding-bottom: 20px; }
        .test-case:last-child { border-bottom: none; }
        .url-info { margin: 10px 0; font-family: monospace; background: #f5f5f5; padding: 10px; overflow-wrap: break-word; }
        .image-container { display: flex; flex-wrap: wrap; gap: 20px; }
        .image-item { flex: 1; min-width: 300px; }
        img { max-width: 100%; height: auto; display: block; margin: 10px 0; border: 1px dashed #ccc; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .status { margin-top: 5px; }
    </style>
</head>
<body>
    <h1>Тестовая страница для отладки изображений S3</h1>
    <p>Эта страница содержит различные варианты URL изображений из S3 для отладки проблем с загрузкой.</p>
    
    <div class="test-section">
        <h2>1. Прямые URL</h2>
        
        <div class="test-case">
            <h3>1.1. Стандартный URL</h3>
            <div class="url-info">$userUrl</div>
            <div class="image-container">
                <div class="image-item">
                    <img src="$userUrl" alt="Стандартный URL" onerror="this.onerror=null; this.nextElementSibling.innerHTML='<span class=\'error\'>Ошибка загрузки!</span>'; this.nextElementSibling.style.display='block';" onload="this.nextElementSibling.innerHTML='<span class=\'success\'>Успешно загружено!</span>'; this.nextElementSibling.style.display='block';">
                    <div class="status" style="display: none;"></div>
                </div>
            </div>
        </div>
        
        <div class="test-case">
            <h3>1.2. URL с параметрами безопасности</h3>
            <div class="url-info">$($secureUrl.Substring(0, [Math]::Min(100, $secureUrl.Length)))...</div>
            <div class="image-container">
                <div class="image-item">
                    <img src="$secureUrl" alt="URL с параметрами безопасности" onerror="this.onerror=null; this.nextElementSibling.innerHTML='<span class=\'error\'>Ошибка загрузки!</span>'; this.nextElementSibling.style.display='block';" onload="this.nextElementSibling.innerHTML='<span class=\'success\'>Успешно загружено!</span>'; this.nextElementSibling.style.display='block';">
                    <div class="status" style="display: none;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="test-section">
        <h2>2. Через прокси API</h2>
        
        <div class="test-case">
            <h3>2.1. Стандартный URL через прокси</h3>
            <div class="url-info">/api/s3-proxy/$encodedUrl</div>
            <div class="image-container">
                <div class="image-item">
                    <img src="/api/s3-proxy/$encodedUrl" alt="Стандартный URL через прокси" onerror="this.onerror=null; this.nextElementSibling.innerHTML='<span class=\'error\'>Ошибка загрузки!</span>'; this.nextElementSibling.style.display='block';" onload="this.nextElementSibling.innerHTML='<span class=\'success\'>Успешно загружено!</span>'; this.nextElementSibling.style.display='block';">
                    <div class="status" style="display: none;"></div>
                </div>
            </div>
        </div>
        
        <div class="test-case">
            <h3>2.2. URL с параметрами безопасности через прокси</h3>
            <div class="url-info">/api/s3-proxy/$($encodedSecureUrl.Substring(0, [Math]::Min(100, $encodedSecureUrl.Length)))...</div>
            <div class="image-container">
                <div class="image-item">
                    <img src="/api/s3-proxy/$encodedSecureUrl" alt="URL с параметрами безопасности через прокси" onerror="this.onerror=null; this.nextElementSibling.innerHTML='<span class=\'error\'>Ошибка загрузки!</span>'; this.nextElementSibling.style.display='block';" onload="this.nextElementSibling.innerHTML='<span class=\'success\'>Успешно загружено!</span>'; this.nextElementSibling.style.display='block';">
                    <div class="status" style="display: none;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="test-section">
        <h2>3. Тест HTML-контента с изображениями</h2>
        
        <div class="test-case">
            <h3>3.1. HTML с прямыми URL</h3>
            <div class="url-info">&lt;img src="$userUrl"&gt;</div>
            <div id="html-test-1">
                <p>Это тестовый HTML-контент с прямым URL изображения:</p>
                <img src="$userUrl" alt="Изображение в HTML" onerror="this.onerror=null; document.getElementById('html-status-1').innerHTML='<span class=\'error\'>Ошибка загрузки!</span>'; document.getElementById('html-status-1').style.display='block';" onload="document.getElementById('html-status-1').innerHTML='<span class=\'success\'>Успешно загружено!</span>'; document.getElementById('html-status-1').style.display='block';">
                <div id="html-status-1" style="display: none;"></div>
            </div>
        </div>
        
        <div class="test-case">
            <h3>3.2. HTML с URL через прокси</h3>
            <div class="url-info">&lt;img src="/api/s3-proxy/$encodedUrl"&gt;</div>
            <div id="html-test-2">
                <p>Это тестовый HTML-контент с URL изображения через прокси:</p>
                <img src="/api/s3-proxy/$encodedUrl" alt="Изображение в HTML через прокси" onerror="this.onerror=null; document.getElementById('html-status-2').innerHTML='<span class=\'error\'>Ошибка загрузки!</span>'; document.getElementById('html-status-2').style.display='block';" onload="document.getElementById('html-status-2').innerHTML='<span class=\'success\'>Успешно загружено!</span>'; document.getElementById('html-status-2').style.display='block';">
                <div id="html-status-2" style="display: none;"></div>
            </div>
        </div>
    </div>
    
    <div class="test-section">
        <h2>4. Информация о диагностике</h2>
        <div id="diagnostics">
            <p><strong>URL браузера:</strong> <span id="browser-url"></span></p>
            <p><strong>User Agent:</strong> <span id="user-agent"></span></p>
            <p><strong>Время загрузки страницы:</strong> <span id="load-time"></span></p>
        </div>
        
        <script>
            // Заполняем диагностическую информацию
            document.getElementById('browser-url').textContent = window.location.href;
            document.getElementById('user-agent').textContent = navigator.userAgent;
            
            // Измеряем время загрузки
            window.addEventListener('load', function() {
                const loadTime = performance.now() / 1000;
                document.getElementById('load-time').textContent = loadTime.toFixed(2) + ' секунд';
            });
        </script>
    </div>
</body>
</html>
"@

# Создаем директорию для тестовых файлов, если её нет
if (-not (Test-Path "public/debug")) {
    New-Item -ItemType Directory -Path "public/debug" -Force | Out-Null
}

# Сохраняем HTML-файл
$htmlContent | Out-File -FilePath "public/debug/s3-image-test.html" -Encoding utf8

Write-ColorMessage "`nТестовая страница создана: public/debug/s3-image-test.html" $Green
Write-ColorMessage "После запуска сервера откройте: http://localhost:3000/debug/s3-image-test.html" $Cyan

# Проверяем, запущен ли локальный сервер
$serverRunning = $false
try {
    $request = [System.Net.WebRequest]::Create("http://localhost:3000")
    $request.Method = "HEAD"
    $request.Timeout = 3000
    $response = $request.GetResponse()
    $response.Close()
    $serverRunning = $true
}
catch {
    $serverRunning = $false
}

if (-not $serverRunning) {
    Write-ColorMessage "`n⚠ Локальный сервер не запущен." $Yellow
    Write-ColorMessage "Хотите запустить сервер сейчас? (y/n)" $Cyan
    $startServer = Read-Host
    
    if ($startServer -eq "y" -or $startServer -eq "Y") {
        Write-ColorMessage "Запуск сервера..." $Green
        Write-ColorMessage "Нажмите Ctrl+C для остановки сервера" $Yellow
        npm run dev
    }
    else {
        Write-ColorMessage "Запустите сервер вручную командой 'npm run dev' и откройте тестовую страницу." $Yellow
    }
}
else {
    Write-ColorMessage "`n✓ Локальный сервер уже запущен." $Green
    Write-ColorMessage "Откройте тестовую страницу: http://localhost:3000/debug/s3-image-test.html" $Cyan
} 