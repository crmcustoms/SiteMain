# Скрипт для проверки доступности изображений с полными URL и параметрами безопасности
# Проверяет доступность изображений по полным URL с параметрами безопасности AWS

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

# Функция для проверки доступности URL
function Test-Url {
    param (
        [string]$Url,
        [string]$Description,
        [switch]$FollowRedirects = $true,
        [int]$MaxRedirects = 5
    )
    
    try {
        Write-ColorMessage "Проверка $Description..." $Yellow
        
        # Выводим только первые 100 символов URL для читаемости
        if ($Url.Length -gt 100) {
            Write-ColorMessage "URL: $($Url.Substring(0, 100))..." -Color $Cyan
        } else {
            Write-ColorMessage "URL: $Url" -Color $Cyan
        }
        
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Method = "HEAD"
        $request.Timeout = 10000 # 10 секунд
        $request.AllowAutoRedirect = $false # Отключаем автоматическое перенаправление
        
        try {
            $response = $request.GetResponse()
            $statusCode = [int]$response.StatusCode
            $statusDescription = $response.StatusDescription
            $contentType = $response.ContentType
            $contentLength = $response.ContentLength
            $headers = $response.Headers
            $response.Close()
            
            if ($statusCode -eq 200) {
                Write-ColorMessage "✓ Доступно (Статус: $statusCode $statusDescription, Тип: $contentType, Размер: $contentLength байт)" $Green
                
                # Выводим заголовки ответа
                Write-ColorMessage "  Заголовки ответа:" $Yellow
                for ($i = 0; $i -lt $headers.Count; $i++) {
                    $name = $headers.GetKey($i)
                    $value = $headers.Get($i)
                    Write-ColorMessage "  - $name: $value" -Color [ConsoleColor]::Gray
                }
                
                return $true
            }
            else {
                Write-ColorMessage "✗ Недоступно (Статус: $statusCode $statusDescription)" $Red
                return $false
            }
        }
        catch [System.Net.WebException] {
            if ($_.Exception.Response -ne $null) {
                $statusCode = [int]$_.Exception.Response.StatusCode
                $statusDescription = $_.Exception.Response.StatusDescription
                
                if (($statusCode -eq 301 -or $statusCode -eq 302 -or $statusCode -eq 307) -and $FollowRedirects -and $MaxRedirects -gt 0) {
                    $location = $_.Exception.Response.Headers["Location"]
                    Write-ColorMessage "→ Перенаправление (Статус: $statusCode, Локация: $location)" $Yellow
                    
                    # Проверяем URL перенаправления
                    Write-ColorMessage "  Следуем по перенаправлению..." $Yellow
                    return (Test-Url -Url $location -Description "URL перенаправления" -FollowRedirects -MaxRedirects ($MaxRedirects - 1))
                }
                else {
                    Write-ColorMessage "✗ Ошибка (Статус: $statusCode $statusDescription)" $Red
                    
                    # Выводим заголовки ответа при ошибке
                    if ($_.Exception.Response.Headers -ne $null) {
                        Write-ColorMessage "  Заголовки ответа:" $Yellow
                        $headers = $_.Exception.Response.Headers
                        for ($i = 0; $i -lt $headers.Count; $i++) {
                            $name = $headers.GetKey($i)
                            $value = $headers.Get($i)
                            Write-ColorMessage "  - $name: $value" -Color [ConsoleColor]::Gray
                        }
                    }
                    
                    return $false
                }
            }
            else {
                Write-ColorMessage "✗ Ошибка: $($_.Exception.Message)" $Red
                return $false
            }
        }
        catch {
            Write-ColorMessage "✗ Ошибка: $($_.Exception.Message)" $Red
            return $false
        }
    }
    catch {
        Write-ColorMessage "✗ Критическая ошибка: $($_.Exception.Message)" $Red
        return $false
    }
}

# Функция для проверки URL через прокси API
function Test-ProxyUrl {
    param (
        [string]$OriginalUrl,
        [string]$Description
    )
    
    try {
        $encodedUrl = [System.Web.HttpUtility]::UrlEncode($OriginalUrl)
        $proxyUrl = "http://localhost:3000/api/s3-proxy/$encodedUrl"
        
        Write-ColorMessage "Проверка через прокси API: $Description..." $Yellow
        Write-ColorMessage "Оригинальный URL: $($OriginalUrl.Substring(0, [Math]::Min(100, $OriginalUrl.Length)))..." -Color $Cyan
        Write-ColorMessage "Прокси URL: /api/s3-proxy/[encoded]" -Color $Cyan
        
        $request = [System.Net.WebRequest]::Create($proxyUrl)
        $request.Method = "GET"
        $request.Timeout = 10000 # 10 секунд
        
        try {
            $response = $request.GetResponse()
            $statusCode = [int]$response.StatusCode
            $statusDescription = $response.StatusDescription
            $contentType = $response.ContentType
            $contentLength = $response.ContentLength
            $response.Close()
            
            if ($statusCode -eq 200) {
                Write-ColorMessage "✓ Доступно через прокси (Статус: $statusCode $statusDescription, Тип: $contentType, Размер: $contentLength байт)" $Green
                return $true
            }
            else {
                Write-ColorMessage "✗ Недоступно через прокси (Статус: $statusCode $statusDescription)" $Red
                return $false
            }
        }
        catch {
            Write-ColorMessage "✗ Ошибка при доступе через прокси: $($_.Exception.Message)" $Red
            return $false
        }
    }
    catch {
        Write-ColorMessage "✗ Критическая ошибка при доступе через прокси: $($_.Exception.Message)" $Red
        return $false
    }
}

# Проверяем наличие System.Web.HttpUtility
if (-not ([System.Management.Automation.PSTypeName]'System.Web.HttpUtility').Type) {
    Add-Type -AssemblyName System.Web
}

# Выводим заголовок
Write-ColorMessage "=== Проверка доступности изображений с полными URL и параметрами безопасности ===" $Cyan
Write-ColorMessage "Эта утилита проверяет доступность изображений по полным URL с параметрами безопасности AWS" $Yellow
Write-ColorMessage "и помогает определить проблемы с доступом к изображениям." $Yellow
Write-ColorMessage ""

# Запрашиваем у пользователя полный URL для проверки
Write-ColorMessage "Введите полный URL изображения для проверки (или нажмите Enter для использования тестового URL):" $Cyan
$userUrl = Read-Host

if ([string]::IsNullOrWhiteSpace($userUrl)) {
    # Тестовый URL с параметрами безопасности
    $userUrl = "https://s3.us-west-2.amazonaws.com/crmcustoms.site/test-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VDHCC7NV%2F20250710%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250710T134442Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQChu1ZMpe9HMqtMtDL76N8IKbK3lmW%2B6InS8N5h0IlHYQIhAIO4F0S8GJJeWD6TGKzsI95%2FEzpDs%2FwIRkwMo%2F%2Fb0Di9KogECL3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgxG5BBNBfDE7lij3tEq3ANeJ0ysD5oI%2B8SfSXKu%2F0q%2BkYJnQcjIwXvjwdVLJmgc7sF7SKx8Q85eWtDi3JFFqre%2BkMibQ2bRRFVN3e3APoNTe0roQFLrfpDXnEAU9FP71xwPCY3k0fmCQXFUhGoANucpSRWAlOFbRxY4R9Sa2yW0geqoiLrHZc05tsFlHyQ9dQIRzkyyD7FYcNzjBc9Fk%2F89nNWb8Wzgfm4hSw5oD4cJ9f5zArJrKTVqC3N1MPhEnYs0ZoZOda3Z88vthxi%2BzamqqxaHcZra97uNA%2BTduCG%2F4moc418P0lq3V4EeEW3VMAdzCnp%2BBP9Y7a8Xm6XtzutPXYZ5TwlS0DrP6EzSRXuxsrXFSLTrKasIOtyKLFdfTrOOdbOaCbaMkIIJOxw36cRzTe%2BoyJmMT6PohVeDpf7qn5axIBvWOCJwAE6HDNScVFIV7EJbp%2BI0s9a99wlN%2FpI0NmQ%2FPqk3GX%2FS4xJvNnjn6lxtXgH6CvuOKLKKID8q93rMer4WhnmxNxhHess63IxGOFISr9RN2Rzh8qjnyDxUNApNPfcUpRwRh679I1Oyqq%2BOTtoOwMdBrqc8OFWjD9ScP%2BFmVPb0JIKC4S0TljhyWbDf5O599xBdo7Xec5%2BKMLvK2qsqVnOF5WJOpjDk4b7DBjqkATNQ5LE1D6E2LSl4UC%2FjFba6R8C1eBFIsNJdeAtmiSd9KvP2m8h7MhTNzN5CnwGxaSOn%2B8mkBQjdRlUlDk80o1b%2BMAbsZJZvmz0Tw4sxFW3S1xiCATDWdirU1pnZmPoJvaCQSKCf9PAqqeOve0F9%2BcDvolEZqD2tnFHaAF9kpEAmdkp0SbnSIDPGbJhfgeTah6J7DMAbapJFljICnm%2FexJrTQbAM&X-Amz-Signature=2992b1f9b94921cb0e61409d0f99a92c8cab77992deb325849675d0bdc7b6e62&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
    Write-ColorMessage "Используется тестовый URL с параметрами безопасности" $Yellow
}

# Проверяем URL напрямую
Write-ColorMessage "`n--- Прямая проверка URL ---" $Cyan
$directSuccess = Test-Url -Url $userUrl -Description "Полный URL с параметрами безопасности"

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

# Если локальный сервер запущен, проверяем через прокси API
if ($serverRunning) {
    Write-ColorMessage "`n--- Проверка через прокси API ---" $Cyan
    $proxySuccess = Test-ProxyUrl -OriginalUrl $userUrl -Description "Полный URL через прокси API"
}
else {
    Write-ColorMessage "`n⚠ Локальный сервер не запущен. Проверка через прокси API невозможна." $Yellow
    Write-ColorMessage "  Запустите сервер командой 'npm run dev' и повторите проверку." $Yellow
    $proxySuccess = $false
}

# Выводим сводку результатов
Write-ColorMessage "`n=== Сводка результатов ===" $Cyan
Write-ColorMessage "Прямой доступ: $(if ($directSuccess) { "✓ Доступно" } else { "✗ Недоступно" })" $(if ($directSuccess) { $Green } else { $Red })

if ($serverRunning) {
    Write-ColorMessage "Доступ через прокси API: $(if ($proxySuccess) { "✓ Доступно" } else { "✗ Недоступно" })" $(if ($proxySuccess) { $Green } else { $Red })
}

# Выводим рекомендации
Write-ColorMessage "`nРекомендации:" $Yellow
if (-not $directSuccess -and -not $proxySuccess) {
    Write-ColorMessage "1. Проверьте правильность URL и параметров безопасности" $Yellow
    Write-ColorMessage "2. Убедитесь, что токены безопасности не истекли" $Yellow
    Write-ColorMessage "3. Проверьте настройки CORS для бакета S3" $Yellow
    Write-ColorMessage "4. Проверьте права доступа к объекту" $Yellow
}
elseif ($directSuccess -and -not $proxySuccess) {
    Write-ColorMessage "1. Проверьте реализацию прокси API" $Yellow
    Write-ColorMessage "2. Убедитесь, что URL правильно кодируется при передаче в API" $Yellow
    Write-ColorMessage "3. Проверьте логи сервера на наличие ошибок" $Yellow
}
elseif (-not $directSuccess -and $proxySuccess) {
    Write-ColorMessage "1. Прокси API работает корректно, но прямой доступ невозможен" $Yellow
    Write-ColorMessage "2. Это нормальное поведение для приватных бакетов S3" $Yellow
    Write-ColorMessage "3. Продолжайте использовать прокси API для доступа к изображениям" $Yellow
}
else {
    Write-ColorMessage "1. Все работает корректно!" $Green
    Write-ColorMessage "2. Изображения доступны как напрямую, так и через прокси API" $Green
}

Write-ColorMessage "`nПроверка завершена!" $Cyan 