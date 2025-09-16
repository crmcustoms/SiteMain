# Скрипт для запуска минимального сервера Node.js на альтернативном порту

Write-Host "Starting minimal Node.js server on alternative port..." -ForegroundColor Green

# Проверка наличия файла-заглушки
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

# Проверяем наличие файла сервера
$serverPath = "minimal-server-alt-port.js"
if (-not (Test-Path $serverPath)) {
    Write-Host "Server file not found! Creating a default one..." -ForegroundColor Red
    
    # Создаем файл сервера
    $serverContent = @"
// Минимальный сервер для тестирования
const http = require('http');
const fs = require('fs');
const path = require('path');

// Порт для сервера
const PORT = 3001;

// Функция для логирования
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Функция для обработки ошибок
function handleError(res, statusCode, message) {
  log(`Error: ${statusCode} - ${message}`);
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(`Error ${statusCode}: ${message}`);
}

// Функция для получения запасного изображения
function getFallbackImage() {
  try {
    const placeholderPath = path.join(__dirname, 'public', 'placeholder.jpg');
    
    if (fs.existsSync(placeholderPath)) {
      return fs.readFileSync(placeholderPath);
    }
    
    // Если файл не найден, возвращаем пустое изображение
    return Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  } catch (error) {
    log(`Error getting fallback image: ${error.message}`);
    return Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  }
}

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  log(`Request: ${req.method} ${pathname}`);
  
  // Обрабатываем запрос к /health
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running');
    return;
  }
  
  // Обрабатываем запрос к корню
  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Minimal Test Server (Alt Port)</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; }
          img { max-width: 100%; height: auto; }
          .test-container { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Minimal Test Server (Port 3001)</h1>
        <p>Server is running correctly!</p>
        
        <div class="test-container">
          <h2>Local Image Test:</h2>
          <img src="/placeholder.jpg" alt="Local Test Image" style="border: 1px solid #ddd; padding: 10px;">
        </div>
        
        <div class="test-container">
          <h2>Notion S3 Image Test (AWS Signed URL):</h2>
          <img src="/api/s3-proxy/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466XUMFQ3IR%2F20250720%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250720T093502Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJ%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIHJvFfpeJ2vH3cxWKAGZv0mgiY61eiNzPPVrt%2BtIPKpMAiARs0Z8z96ENyo%2F8%2F3qR71Tx%2BBT54QbIaRBsWd%2B6WmHniqIBAi4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMogvVEv%2F8b%2B473MVhKtwD5FDG5DAC%2B6mJxQjzeO%2Bl4K3LUdgzdh7djP987JQI5zIXfTpHsi5yvfQec5vtPmqAItAzSyywlSqh%2FoZ4OrowNNi6sknuDNl%2Fr13fawI458oQkK78VLYijcwX%2B9%2FZE0X0WRPD1EBcN89YJy8pFKlTOi0PlrAgy3gPbF5Xn2Mala7cbPuUqkqhaHJzvD%2FD5ON%2BeBQWS06UDozRSgT9no7ZkgpdFfc1OJ%2BxYFMglg8WICV%2Bl9OPmKdnq1VtNq8wJFVlSZsLqzUS5%2F%2BfCqNFMLYhm9uwN%2FdIvVGcNOrMAnLUuhq3hXPAvX3Vrgj1po3%2BektsJDw55UrTjXjXXI2s%2B4h3rN3Mo3ipGmDNONf8xujpf83K3XfbL08asrNQjoTuk7c9mhu2xVlrbJeDpZp0Axhx2CnYcnQRpXpUBDUYPweZyxccEpGwbws%2ByHaWTt5MLjSaJiaJSUOCKiFZeNmVVmlKdFcb1VtqsxjF4dpPb53ve3WGTIVB%2Bp9nL79fALd4Z1eUqbV9Qa2OLdw69uN2XHGtXpLbTG2kubw9DfowSV8ORTP%2B7TNj9ZLZTXkCxnqCoGrFmsBOnri7lB3Rg9oRTRvso5vktBAhizF1jQSSZx1HfJlhh%2FieealTGSi%2Fo%2BswzaLywwY6pgFD%2FnIcYI5MWcKt8cXjX%2FLIK0mSL%2FhKCuRqEIWIvz0VAFp66PL8Elt5zyOnpWC6Ed%2F2PCDK6OxoJQIfJb2IawQiLiYPdlSiLzKR4ulRo8TklCg2Jg4RnIeQlS80BIIB0XPGn7wMbrv8WemffStAuz4kRIXz6M28Yjg2XLBEo%2BUB9GlpsTPAGIcAvX8dNcWKErnHEBCAMogM1rbccMwxSRGAp6GGM5ON&X-Amz-Signature=eaff2888720ac603afb85abc9c8baf52ca85fe32c955499bfb1a7dd3ae424dd3&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject" 
               alt="S3 AWS Signed URL Test" 
               onerror="this.onerror=null;this.src='/placeholder.jpg';">
        </div>
        
        <div class="test-container">
          <h2>Direct S3 URL Test:</h2>
          <img src="/api/s3-proxy/https://s3.amazonaws.com/crmcustoms.site/test-image.jpg" 
               alt="S3 Direct URL Test" 
               onerror="this.onerror=null;this.src='/placeholder.jpg';">
        </div>
        
        <h2>Server Info:</h2>
        <pre>Node.js ${process.version}</pre>
        <pre>Current time: ${new Date().toISOString()}</pre>
        
        <p><a href="/health">Check server health</a></p>
      </body>
      </html>
    `);
    return;
  }
  
  // Обрабатываем запрос к placeholder.jpg
  if (pathname === '/placeholder.jpg') {
    const fallbackImage = getFallbackImage();
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(fallbackImage);
    return;
  }
  
  // Обрабатываем запрос к S3 прокси
  if (pathname.startsWith('/api/s3-proxy/')) {
    // Для тестирования всегда возвращаем заглушку
    const fallbackImage = getFallbackImage();
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(fallbackImage);
    return;
  }
  
  // Для всех остальных запросов возвращаем 404
  handleError(res, 404, 'Not Found');
});

// Запускаем сервер
server.listen(PORT, () => {
  log(`Minimal server running at http://localhost:${PORT}`);
});
"@
    
    Set-Content -Path $serverPath -Value $serverContent
    Write-Host "Default server file created." -ForegroundColor Green
}

# Запуск сервера
Write-Host "Starting server..." -ForegroundColor Green
Write-Host "Server will be available at http://localhost:3001" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow

# Запускаем сервер
node $serverPath 