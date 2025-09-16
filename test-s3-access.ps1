# Скрипт для тестирования прямого доступа к S3

Write-Host "Testing direct S3 access..." -ForegroundColor Green

# Тестовые URL для проверки
$testUrls = @(
    "https://s3.amazonaws.com/crmcustoms.site/Untitled.png",
    "https://crmcustoms.site.s3.amazonaws.com/Untitled.png",
    "https://s3.us-east-1.amazonaws.com/crmcustoms.site/Untitled.png",
    "https://s3.us-west-2.amazonaws.com/crmcustoms.site/Untitled.png"
)

# Функция для проверки доступности URL
function Test-Url {
    param (
        [string]$Url
    )
    
    Write-Host "Testing URL: $Url" -ForegroundColor Yellow
    
    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Method = "HEAD"
        $request.Timeout = 5000
        
        try {
            $response = $request.GetResponse()
            $statusCode = [int]$response.StatusCode
            $response.Close()
            
            if ($statusCode -eq 200) {
                Write-Host "SUCCESS: URL is accessible (Status: $statusCode)" -ForegroundColor Green
                return $true
            } else {
                Write-Host "WARNING: URL returned status code $statusCode" -ForegroundColor Yellow
                return $false
            }
        } catch [System.Net.WebException] {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "ERROR: URL is not accessible (Status: $statusCode)" -ForegroundColor Red
            Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "ERROR: Failed to test URL" -ForegroundColor Red
        Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Проверяем каждый URL
$successCount = 0
foreach ($url in $testUrls) {
    if (Test-Url -Url $url) {
        $successCount++
    }
    Write-Host ""
}

# Выводим результаты
Write-Host "Test Results:" -ForegroundColor Cyan
Write-Host "$successCount out of $($testUrls.Count) URLs are accessible" -ForegroundColor Cyan

if ($successCount -eq 0) {
    Write-Host ""
    Write-Host "RECOMMENDATION:" -ForegroundColor Red
    Write-Host "1. Check if the AWS credentials are valid" -ForegroundColor Yellow
    Write-Host "2. Verify that the S3 bucket 'crmcustoms.site' exists" -ForegroundColor Yellow
    Write-Host "3. Check if the bucket permissions allow public access" -ForegroundColor Yellow
    Write-Host "4. Try accessing the URLs directly in a browser" -ForegroundColor Yellow
    Write-Host ""
}

# Проверяем доступность через API-маршрут
Write-Host "Testing API route access..." -ForegroundColor Green
Write-Host "Please make sure the server is running before continuing." -ForegroundColor Yellow
$continue = Read-Host "Press Enter to continue or type 'skip' to skip this test"

if ($continue -ne "skip") {
    $baseUrl = "http://localhost:3000/api/s3-proxy/"
    
    foreach ($url in $testUrls) {
        $encodedUrl = [System.Web.HttpUtility]::UrlEncode($url)
        $apiUrl = $baseUrl + $encodedUrl
        
        Write-Host "Testing API route: $apiUrl" -ForegroundColor Yellow
        Test-Url -Url $apiUrl
        Write-Host ""
    }
} 