# Скрипт для проверки доступности сервера

Write-Host "Checking server availability..." -ForegroundColor Green

# Функция для проверки URL
function Test-Url {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Checking $Description ($Url)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        Write-Host "  Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
        Write-Host "  Response size: $($response.Content.Length) bytes" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Проверяем основные URL
$mainUrl = "http://localhost:3000"
$healthUrl = "http://localhost:3000/health"
$placeholderUrl = "http://localhost:3000/placeholder.jpg"

$mainSuccess = Test-Url -Url $mainUrl -Description "main page"
$healthSuccess = Test-Url -Url $healthUrl -Description "health check"
$placeholderSuccess = Test-Url -Url $placeholderUrl -Description "placeholder image"

# Выводим итоговый результат
Write-Host ""
Write-Host "Check results:" -ForegroundColor Cyan
Write-Host "-------------" -ForegroundColor Cyan

if ($mainSuccess -and $healthSuccess -and $placeholderSuccess) {
    Write-Host "All checks passed! Server is working correctly." -ForegroundColor Green
} else {
    Write-Host "Some checks failed. Server may not be working correctly." -ForegroundColor Red
    
    if (-not $mainSuccess) {
        Write-Host "- Main page is not available" -ForegroundColor Red
    }
    
    if (-not $healthSuccess) {
        Write-Host "- Health check is not available" -ForegroundColor Red
    }
    
    if (-not $placeholderSuccess) {
        Write-Host "- Placeholder image is not available" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "1. Make sure the server is running (execute .\run-minimal-server.ps1)" -ForegroundColor Yellow
    Write-Host "2. Check if port 3000 is not used by another application" -ForegroundColor Yellow
    Write-Host "3. Check if the file public/placeholder.jpg exists" -ForegroundColor Yellow
} 