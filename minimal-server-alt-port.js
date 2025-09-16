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
          <img src="/api/s3-proxy/test-image.jpg" 
               alt="S3 AWS Signed URL Test" 
               onerror="this.onerror=null;this.src='/placeholder.jpg';">
        </div>
        
        <div class="test-container">
          <h2>Direct S3 URL Test:</h2>
          <img src="/api/s3-proxy/test-image.jpg" 
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
