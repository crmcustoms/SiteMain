// Простой сервер для тестирования
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Порт для сервера
const PORT = process.env.PORT || 3000;

// Типы MIME для различных файлов
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.txt': 'text/plain'
};

// Кеш для изображений
const imageCache = new Map();

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

// Функция для обработки запросов к S3 прокси
async function handleS3Proxy(req, res, pathname) {
  try {
    // Извлекаем путь к изображению (все после /api/s3-proxy/)
    const imagePath = decodeURIComponent(pathname.replace(/^\/api\/s3-proxy\//, ''));
    
    log(`S3 proxy request: ${imagePath.substring(0, 100)}...`);
    
    // Проверяем кеш
    if (imageCache.has(imagePath)) {
      log(`Returning cached image for: ${imagePath.substring(0, 50)}...`);
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
      res.end(imageCache.get(imagePath));
      return;
    }
    
    // Для тестирования всегда возвращаем заглушку
    const fallbackImage = getFallbackImage();
    
    // Сохраняем в кеш
    imageCache.set(imagePath, fallbackImage);
    
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
    res.end(fallbackImage);
  } catch (error) {
    log(`Error in S3 proxy handler: ${error.message}`);
    handleError(res, 500, 'Internal Server Error');
  }
}

// Функция для обслуживания статических файлов
function serveStaticFile(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        handleError(res, 404, 'File not found');
      } else {
        handleError(res, 500, `Error reading file: ${err.message}`);
      }
      return;
    }
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Создаем тестовую HTML-страницу
function createTestPage() {
  const testPagePath = path.join(__dirname, 'test', 's3-image-test.html');
  
  // Создаем директорию test, если она не существует
  if (!fs.existsSync(path.join(__dirname, 'test'))) {
    fs.mkdirSync(path.join(__dirname, 'test'));
  }
  
  const testPageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S3 Image Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .image-container { margin: 20px 0; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
    img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
    .placeholder { background-color: #f0f0f0; height: 300px; display: flex; align-items: center; justify-content: center; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>S3 Image Test</h1>
  
  <div class="image-container">
    <h2>Placeholder Image</h2>
    <img src="/placeholder.jpg" alt="Placeholder" onerror="this.onerror=null;this.src='/placeholder.jpg';">
  </div>
  
  <div class="image-container">
    <h2>S3 Proxy Test</h2>
    <img src="/api/s3-proxy/test-image.jpg" alt="S3 Proxy Test" onerror="this.onerror=null;this.src='/placeholder.jpg';">
  </div>
  
  <div class="image-container">
    <h2>S3 Direct URL Test</h2>
    <img src="/api/s3-proxy/https://s3.amazonaws.com/crmcustoms.site/test-image.jpg" alt="S3 Direct URL Test" onerror="this.onerror=null;this.src='/placeholder.jpg';">
  </div>
  
  <div class="image-container">
    <h2>S3 AWS Signed URL Test</h2>
    <img src="/api/s3-proxy/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466XUMFQ3IR%2F20250720%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250720T093502Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJ%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIHJvFfpeJ2vH3cxWKAGZv0mgiY61eiNzPPVrt%2BtIPKpMAiARs0Z8z96ENyo%2F8%2F3qR71Tx%2BBT54QbIaRBsWd%2B6WmHniqIBAi4%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMogvVEv%2F8b%2B473MVhKtwD5FDG5DAC%2B6mJxQjzeO%2Bl4K3LUdgzdh7djP987JQI5zIXfTpHsi5yvfQec5vtPmqAItAzSyywlSqh%2FoZ4OrowNNi6sknuDNl%2Fr13fawI458oQkK78VLYijcwX%2B9%2FZE0X0WRPD1EBcN89YJy8pFKlTOi0PlrAgy3gPbF5Xn2Mala7cbPuUqkqhaHJzvD%2FD5ON%2BeBQWS06UDozRSgT9no7ZkgpdFfc1OJ%2BxYFMglg8WICV%2Bl9OPmKdnq1VtNq8wJFVlSZsLqzUS5%2F%2BfCqNFMLYhm9uwN%2FdIvVGcNOrMAnLUuhq3hXPAvX3Vrgj1po3%2BektsJDw55UrTjXjXXI2s%2B4h3rN3Mo3ipGmDNONf8xujpf83K3XfbL08asrNQjoTuk7c9mhu2xVlrbJeDpZp0Axhx2CnYcnQRpXpUBDUYPweZyxccEpGwbws%2ByHaWTt5MLjSaJiaJSUOCKiFZeNmVVmlKdFcb1VtqsxjF4dpPb53ve3WGTIVB%2Bp9nL79fALd4Z1eUqbV9Qa2OLdw69uN2XHGtXpLbTG2kubw9DfowSV8ORTP%2B7TNj9ZLZTXkCxnqCoGrFmsBOnri7lB3Rg9oRTRvso5vktBAhizF1jQSSZx1HfJlhh%2FieealTGSi%2Fo%2BswzaLywwY6pgFD%2FnIcYI5MWcKt8cXjX%2FLIK0mSL%2FhKCuRqEIWIvz0VAFp66PL8Elt5zyOnpWC6Ed%2F2PCDK6OxoJQIfJb2IawQiLiYPdlSiLzKR4ulRo8TklCg2Jg4RnIeQlS80BIIB0XPGn7wMbrv8WemffStAuz4kRIXz6M28Yjg2XLBEo%2BUB9GlpsTPAGIcAvX8dNcWKErnHEBCAMogM1rbccMwxSRGAp6GGM5ON&X-Amz-Signature=eaff2888720ac603afb85abc9c8baf52ca85fe32c955499bfb1a7dd3ae424dd3&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject" alt="S3 AWS Signed URL Test" onerror="this.onerror=null;this.src='/placeholder.jpg';">
  </div>
  
  <h2>Server Status</h2>
  <pre id="server-status">Loading...</pre>
  
  <script>
    // Проверяем статус сервера
    fetch('/health')
      .then(response => response.text())
      .then(data => {
        document.getElementById('server-status').textContent = data;
      })
      .catch(error => {
        document.getElementById('server-status').textContent = 'Error: ' + error.message;
      });
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(testPagePath, testPageContent);
  log(`Test page created at ${testPagePath}`);
}

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  log(`Request: ${req.method} ${pathname}`);
  
  // Обрабатываем запросы к API
  if (pathname.startsWith('/api/s3-proxy/')) {
    return handleS3Proxy(req, res, pathname);
  }
  
  // Обрабатываем запрос к /health
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running');
    return;
  }
  
  // Обрабатываем запрос к корню
  if (pathname === '/') {
    // Перенаправляем на тестовую страницу
    res.writeHead(302, { 'Location': '/test/s3-image-test.html' });
    res.end();
    return;
  }
  
  // Обрабатываем запрос к placeholder.jpg
  if (pathname === '/placeholder.jpg') {
    const placeholderPath = path.join(__dirname, 'public', 'placeholder.jpg');
    
    if (fs.existsSync(placeholderPath)) {
      serveStaticFile(req, res, placeholderPath);
    } else {
      // Если файл не найден, возвращаем пустое изображение
      res.writeHead(200, { 'Content-Type': 'image/gif' });
      res.end(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    }
    return;
  }
  
  // Обрабатываем остальные запросы как статические файлы
  let filePath = path.join(__dirname, pathname);
  
  // Проверяем, существует ли файл
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      handleError(res, 404, 'File not found');
      return;
    }
    
    // Проверяем, является ли это директорией
    fs.stat(filePath, (err, stats) => {
      if (err) {
        handleError(res, 500, `Error checking file: ${err.message}`);
        return;
      }
      
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        
        // Проверяем, существует ли index.html
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            handleError(res, 404, 'Directory index not found');
            return;
          }
          
          serveStaticFile(req, res, filePath);
        });
      } else {
        serveStaticFile(req, res, filePath);
      }
    });
  });
});

// Запускаем сервер
server.listen(PORT, () => {
  log(`Server running at http://localhost:${PORT}`);
  log(`Test page available at http://localhost:${PORT}/test/s3-image-test.html`);
});

// Создаем тестовую страницу при запуске
createTestPage(); 