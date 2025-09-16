# Скрипт для проверки доступности изображений из разных регионов S3
# Проверяет доступность изображений из разных регионов S3 и выводит результаты

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
        [string]$Description
    )
    
    try {
        Write-ColorMessage "Проверка $Description..." $Yellow
        Write-ColorMessage "URL: $Url" -Color $Cyan
        
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Method = "HEAD"
        $request.Timeout = 10000 # 10 секунд
        
        try {
            $response = $request.GetResponse()
            $statusCode = [int]$response.StatusCode
            $statusDescription = $response.StatusDescription
            $contentType = $response.ContentType
            $contentLength = $response.ContentLength
            $response.Close()
            
            if ($statusCode -eq 200) {
                Write-ColorMessage "✓ Доступно (Статус: $statusCode $statusDescription, Тип: $contentType, Размер: $contentLength байт)" $Green
                return $true
            }
            else {
                Write-ColorMessage "✗ Недоступно (Статус: $statusCode $statusDescription)" $Red
                return $false
            }
        }
        catch [System.Net.WebException] {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $statusDescription = $_.Exception.Response.StatusDescription
            
            if ($statusCode -eq 301 -or $statusCode -eq 302 -or $statusCode -eq 307) {
                $location = $_.Exception.Response.Headers["Location"]
                Write-ColorMessage "→ Перенаправление (Статус: $statusCode, Локация: $location)" $Yellow
                
                # Проверяем URL перенаправления
                Write-ColorMessage "  Проверка URL перенаправления..." $Yellow
                return (Test-Url -Url $location -Description "URL перенаправления")
            }
            else {
                Write-ColorMessage "✗ Ошибка (Статус: $statusCode $statusDescription)" $Red
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

# Выводим заголовок
Write-ColorMessage "=== Проверка доступности изображений из разных регионов S3 ===" $Cyan
Write-ColorMessage "Эта утилита проверяет доступность изображений из разных регионов Amazon S3" $Yellow
Write-ColorMessage "и помогает определить проблемы с доступом к изображениям." $Yellow
Write-ColorMessage ""

# Список URL для проверки
$urlsToCheck = @(
    @{
        Url = "https://s3.amazonaws.com/crmcustoms.site/test-image.jpg"
        Description = "Стандартный URL (глобальный)"
    },
    @{
        Url = "https://crmcustoms.site.s3.amazonaws.com/test-image.jpg"
        Description = "Стандартный URL (виртуальный хостинг)"
    },
    @{
        Url = "https://s3.us-east-1.amazonaws.com/crmcustoms.site/test-image.jpg"
        Description = "URL с регионом us-east-1"
    },
    @{
        Url = "https://crmcustoms.site.s3.us-east-1.amazonaws.com/test-image.jpg"
        Description = "URL с регионом us-east-1 (виртуальный хостинг)"
    },
    @{
        Url = "https://s3.us-west-2.amazonaws.com/crmcustoms.site/test-image.jpg"
        Description = "URL с регионом us-west-2"
    },
    @{
        Url = "https://crmcustoms.site.s3.us-west-2.amazonaws.com/test-image.jpg"
        Description = "URL с регионом us-west-2 (виртуальный хостинг)"
    },
    @{
        Url = "https://s3.eu-central-1.amazonaws.com/crmcustoms.site/test-image.jpg"
        Description = "URL с регионом eu-central-1"
    },
    @{
        Url = "https://crmcustoms.site.s3.eu-central-1.amazonaws.com/test-image.jpg"
        Description = "URL с регионом eu-central-1 (виртуальный хостинг)"
    }
)

# Проверяем каждый URL
$results = @()
foreach ($urlInfo in $urlsToCheck) {
    Write-ColorMessage "`n--- Проверка $($urlInfo.Description) ---" $Cyan
    $success = Test-Url -Url $urlInfo.Url -Description $urlInfo.Description
    
    $results += [PSCustomObject]@{
        Description = $urlInfo.Description
        Url = $urlInfo.Url
        Success = $success
    }
}

# Выводим сводку результатов
Write-ColorMessage "`n=== Сводка результатов ===" $Cyan
$successCount = ($results | Where-Object { $_.Success -eq $true }).Count
$failCount = $results.Count - $successCount

Write-ColorMessage "Всего проверено URL: $($results.Count)" $Yellow
Write-ColorMessage "Успешно доступны: $successCount" $Green
Write-ColorMessage "Недоступны: $failCount" $Red

if ($successCount -gt 0) {
    Write-ColorMessage "`nДоступные URL:" $Green
    $results | Where-Object { $_.Success -eq $true } | ForEach-Object {
        Write-ColorMessage "- $($_.Description): $($_.Url)" $Green
    }
}

if ($failCount -gt 0) {
    Write-ColorMessage "`nНедоступные URL:" $Red
    $results | Where-Object { $_.Success -eq $false } | ForEach-Object {
        Write-ColorMessage "- $($_.Description): $($_.Url)" $Red
    }
    
    Write-ColorMessage "`nРекомендации:" $Yellow
    Write-ColorMessage "1. Убедитесь, что бакет S3 'crmcustoms.site' существует и доступен" $Yellow
    Write-ColorMessage "2. Проверьте настройки CORS для бакета" $Yellow
    Write-ColorMessage "3. Проверьте права доступа к бакету и объектам" $Yellow
    Write-ColorMessage "4. Убедитесь, что тестовое изображение 'test-image.jpg' существует в бакете" $Yellow
}

Write-ColorMessage "`nПроверка завершена!" $Cyan 