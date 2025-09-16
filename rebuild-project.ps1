# Скрипт для полной перестройки проекта Next.js

Write-Host "Starting full project rebuild..." -ForegroundColor Green

# Очистка кеша и временных файлов
Write-Host "Cleaning cache and temporary files..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Next.js cache cleaned." -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "Node modules cache cleaned." -ForegroundColor Green
}

# Проверка файла _document.js
Write-Host "Checking _document.js file..." -ForegroundColor Yellow
$documentPath = "pages/_document.js"
if (Test-Path $documentPath) {
    Write-Host "_document.js exists." -ForegroundColor Green
} else {
    Write-Host "_document.js not found! Creating default one..." -ForegroundColor Red
    
    $documentContent = @"
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
"@
    
    New-Item -Path $documentPath -ItemType File -Force | Out-Null
    Set-Content -Path $documentPath -Value $documentContent
    Write-Host "Default _document.js created." -ForegroundColor Green
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

# Установка зависимостей заново
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm ci

# Сборка проекта
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

# Запуск сервера разработки
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev 