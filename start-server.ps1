# Скрипт для запуска сервера через Express

Write-Host "Starting server using Express directly..." -ForegroundColor Green

# Очистка кеша Next.js
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Next.js cache cleaned." -ForegroundColor Green
} else {
    Write-Host "Next.js cache not found." -ForegroundColor Yellow
}

# Проверка наличия файла-заглушки
Write-Host "Checking placeholder image..." -ForegroundColor Yellow
$placeholderPath = "public/placeholder.jpg"
if (Test-Path $placeholderPath) {
    Write-Host "Placeholder image found." -ForegroundColor Green
} else {
    Write-Host "Placeholder image not found! Creating a default one..." -ForegroundColor Red
    
    # Создаем простую заглушку с текстом "No Image"
    $tempFile = [System.IO.Path]::GetTempFileName()
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile("https://via.placeholder.com/800x600.jpg?text=No+Image", $tempFile)
    
    # Копируем заглушку в нужное место
    Copy-Item -Path $tempFile -Destination $placeholderPath -Force
    Remove-Item -Path $tempFile -Force
    
    Write-Host "Default placeholder image created." -ForegroundColor Green
}

# Запуск сервера Express
Write-Host "Starting Express server..." -ForegroundColor Green
Write-Host "This will serve the site on http://localhost:3000" -ForegroundColor Yellow

# Запускаем сервер Express
node express-server.js 