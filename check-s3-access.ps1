# Скрипт для проверки доступа к S3 и тестирования URL

Write-Host "Checking S3 access and testing URLs..." -ForegroundColor Green

# Функция для проверки доступности URL
function Test-Url {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Testing $Description ($Url)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -TimeoutSec 5
        Write-Host "  Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Проверяем доступность S3
$s3Urls = @(
    "https://s3.amazonaws.com/crmcustoms.site/test-image.jpg",
    "https://crmcustoms.site.s3.amazonaws.com/test-image.jpg",
    "https://s3.us-east-1.amazonaws.com/crmcustoms.site/test-image.jpg",
    "https://s3.us-west-2.amazonaws.com/crmcustoms.site/test-image.jpg"
)

$successCount = 0
foreach ($url in $s3Urls) {
    $result = Test-Url -Url $url -Description "S3 URL"
    if ($result) {
        $successCount++
    }
}

# Проверяем доступность прокси API
$localUrls = @(
    "http://localhost:3001/health",
    "http://localhost:3001/placeholder.jpg",
    "http://localhost:3001/api/s3-proxy/test-image.jpg"
)

$localSuccessCount = 0
foreach ($url in $localUrls) {
    $result = Test-Url -Url $url -Description "Local URL"
    if ($result) {
        $localSuccessCount++
    }
}

# Выводим итоговый результат
Write-Host ""
Write-Host "S3 Access Test Results:" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan
Write-Host "S3 URLs tested: $($s3Urls.Count)" -ForegroundColor White
Write-Host "S3 URLs accessible: $successCount" -ForegroundColor White
Write-Host "Local URLs tested: $($localUrls.Count)" -ForegroundColor White
Write-Host "Local URLs accessible: $localSuccessCount" -ForegroundColor White

# Выводим рекомендации
Write-Host ""
if ($successCount -eq 0) {
    Write-Host "No S3 URLs are accessible. Possible issues:" -ForegroundColor Red
    Write-Host "1. No internet connection" -ForegroundColor Red
    Write-Host "2. S3 bucket 'crmcustoms.site' does not exist" -ForegroundColor Red
    Write-Host "3. S3 bucket permissions are restrictive" -ForegroundColor Red
    Write-Host "4. AWS credentials are not set up correctly" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "1. Check your internet connection" -ForegroundColor Yellow
    Write-Host "2. Verify the S3 bucket name" -ForegroundColor Yellow
    Write-Host "3. Use placeholder images for development" -ForegroundColor Yellow
    Write-Host "4. Update the S3 proxy to handle errors gracefully" -ForegroundColor Yellow
} elseif ($successCount -lt $s3Urls.Count) {
    Write-Host "Some S3 URLs are accessible, but not all. Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Some S3 regions may be unreachable" -ForegroundColor Yellow
    Write-Host "2. Some URLs may be incorrect" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "1. Update the S3 proxy to try multiple URLs" -ForegroundColor Yellow
    Write-Host "2. Use the working URLs in your application" -ForegroundColor Yellow
} else {
    Write-Host "All S3 URLs are accessible!" -ForegroundColor Green
}

if ($localSuccessCount -eq 0) {
    Write-Host ""
    Write-Host "No local URLs are accessible. Possible issues:" -ForegroundColor Red
    Write-Host "1. Local server is not running" -ForegroundColor Red
    Write-Host "2. Local server is running on a different port" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "1. Run .\run-minimal-server-alt-port.ps1 to start the test server" -ForegroundColor Yellow
    Write-Host "2. Check if port 3001 is already in use" -ForegroundColor Yellow
} elseif ($localSuccessCount -lt $localUrls.Count) {
    Write-Host ""
    Write-Host "Some local URLs are accessible, but not all. Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Some endpoints may not be implemented" -ForegroundColor Yellow
    Write-Host "2. Some endpoints may have errors" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "1. Check the server logs for errors" -ForegroundColor Yellow
    Write-Host "2. Implement missing endpoints" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "All local URLs are accessible!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. If S3 is accessible, update your application to use the working URLs" -ForegroundColor Cyan
Write-Host "2. If S3 is not accessible, use placeholder images for development" -ForegroundColor Cyan
Write-Host "3. Run .\restart-server.ps1 to restart the server with the updated configuration" -ForegroundColor Cyan 