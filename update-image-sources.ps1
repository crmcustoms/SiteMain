# Скрипт для проверки и обновления URL изображений

Write-Host "Checking and updating image sources..." -ForegroundColor Green

# Функция для проверки доступности URL
function Test-ImageUrl {
    param(
        [string]$Url
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Проверяем наличие файла-заглушки
Write-Host "Checking placeholder image..." -ForegroundColor Yellow
$placeholderPath = "public/placeholder.jpg"
if (Test-Path $placeholderPath) {
    Write-Host "Placeholder image found." -ForegroundColor Green
} else {
    Write-Host "Placeholder image not found! Creating a default one..." -ForegroundColor Red
    
    # Создаем директорию public, если она не существует
    if (-not (Test-Path "public")) {
        New-Item -Path "public" -ItemType Directory -Force | Out-Null
        Write-Host "Created public directory." -ForegroundColor Green
    }
    
    # Создаем пустое изображение как заглушку
    $placeholderContent = @"
iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw2AAAAA1BMVEXr6+uInxNMAAAAH0lEQVRo
ge3BMQEAAADCoPVPbQo/oAAAAAAAAAAAABgOcqAAAUWJhY4AAAAASUVORK5CYII=
"@
    
    $bytes = [Convert]::FromBase64String($placeholderContent)
    [System.IO.File]::WriteAllBytes($placeholderPath, $bytes)
    
    Write-Host "Default placeholder image created." -ForegroundColor Green
}

# Проверяем конфигурацию S3 прокси
Write-Host "Checking S3 proxy configuration..." -ForegroundColor Yellow
$s3ProxyPath = "app/api/s3-proxy/route.ts"
if (Test-Path $s3ProxyPath) {
    Write-Host "S3 proxy file found. Checking configuration..." -ForegroundColor Green
    
    $s3ProxyContent = Get-Content $s3ProxyPath -Raw
    
    # Проверяем наличие необходимых доменов S3
    $requiredDomains = @(
        "s3.amazonaws.com/crmcustoms.site",
        "crmcustoms.site.s3.amazonaws.com",
        "s3.us-east-1.amazonaws.com/crmcustoms.site",
        "s3.us-west-2.amazonaws.com/crmcustoms.site"
    )
    
    $missingDomains = @()
    foreach ($domain in $requiredDomains) {
        if (-not $s3ProxyContent.Contains($domain)) {
            $missingDomains += $domain
        }
    }
    
    if ($missingDomains.Count -gt 0) {
        Write-Host "Missing S3 domains in configuration:" -ForegroundColor Red
        $missingDomains | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
        Write-Host "Please update the S3_DOMAINS array in $s3ProxyPath" -ForegroundColor Yellow
    } else {
        Write-Host "S3 domains configuration looks good." -ForegroundColor Green
    }
    
    # Проверяем поддержку AWS подписанных URL
    if (-not $s3ProxyContent.Contains("X-Amz-Algorithm") -or -not $s3ProxyContent.Contains("X-Amz-Credential")) {
        Write-Host "S3 proxy may not properly handle AWS signed URLs." -ForegroundColor Red
        Write-Host "Please update the code to support URLs with X-Amz-Algorithm and X-Amz-Credential parameters." -ForegroundColor Yellow
    } else {
        Write-Host "AWS signed URL support looks good." -ForegroundColor Green
    }
} else {
    Write-Host "S3 proxy file not found at $s3ProxyPath" -ForegroundColor Red
    Write-Host "Please create the file with proper S3 configuration." -ForegroundColor Yellow
}

# Проверяем компоненты, отображающие изображения
Write-Host "Checking image display components..." -ForegroundColor Yellow
$blogDetailPath = "components/blog/blog-detail.tsx"
$caseDetailPath = "components/landing/static-case-detail.jsx"

if (Test-Path $blogDetailPath) {
    Write-Host "Blog detail component found. Checking image handling..." -ForegroundColor Green
    
    $blogDetailContent = Get-Content $blogDetailPath -Raw
    
    # Проверяем обработку ошибок загрузки изображений
    if (-not $blogDetailContent.Contains("onerror=")) {
        Write-Host "Blog detail component may not handle image loading errors properly." -ForegroundColor Red
        Write-Host "Please add onerror handler to fallback to placeholder image." -ForegroundColor Yellow
    } else {
        Write-Host "Image error handling in blog detail looks good." -ForegroundColor Green
    }
    
    # Проверяем поддержку AWS подписанных URL
    if (-not $blogDetailContent.Contains("X-Amz-Algorithm") -or -not $blogDetailContent.Contains("X-Amz-Credential")) {
        Write-Host "Blog detail component may not properly handle AWS signed URLs." -ForegroundColor Red
        Write-Host "Please update the code to support URLs with X-Amz-Algorithm and X-Amz-Credential parameters." -ForegroundColor Yellow
    } else {
        Write-Host "AWS signed URL support in blog detail looks good." -ForegroundColor Green
    }
} else {
    Write-Host "Blog detail component not found at $blogDetailPath" -ForegroundColor Red
}

if (Test-Path $caseDetailPath) {
    Write-Host "Case detail component found. Checking image handling..." -ForegroundColor Green
    
    $caseDetailContent = Get-Content $caseDetailPath -Raw
    
    # Проверяем обработку ошибок загрузки изображений
    if (-not $caseDetailContent.Contains("onerror=")) {
        Write-Host "Case detail component may not handle image loading errors properly." -ForegroundColor Red
        Write-Host "Please add onerror handler to fallback to placeholder image." -ForegroundColor Yellow
    } else {
        Write-Host "Image error handling in case detail looks good." -ForegroundColor Green
    }
    
    # Проверяем поддержку AWS подписанных URL
    if (-not $caseDetailContent.Contains("X-Amz-Algorithm") -or -not $caseDetailContent.Contains("X-Amz-Credential")) {
        Write-Host "Case detail component may not properly handle AWS signed URLs." -ForegroundColor Red
        Write-Host "Please update the code to support URLs with X-Amz-Algorithm and X-Amz-Credential parameters." -ForegroundColor Yellow
    } else {
        Write-Host "AWS signed URL support in case detail looks good." -ForegroundColor Green
    }
} else {
    Write-Host "Case detail component not found at $caseDetailPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "Image source check completed." -ForegroundColor Green
Write-Host "If you need to update image handling, please run the following scripts:" -ForegroundColor Yellow
Write-Host "1. .\stop-all-servers.ps1 - to stop all running servers" -ForegroundColor Yellow
Write-Host "2. .\reinstall-dependencies.ps1 - to reinstall dependencies" -ForegroundColor Yellow
Write-Host "3. .\restart-server.ps1 - to restart the server with clean cache" -ForegroundColor Yellow 