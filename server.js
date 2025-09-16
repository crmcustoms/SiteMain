const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');
const https = require('https');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Подготавливаем приложение Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Функция для обработки запросов к S3
const handleS3Proxy = async (req, res, imagePath) => {
  try {
    console.log(`S3 proxy: Processing request for path: ${imagePath}`);
    
    if (!imagePath) {
      console.error('S3 proxy: Image path is required');
      res.statusCode = 400;
      res.end('Image path is required');
      return;
    }

    // Формируем полный URL до изображения в S3
    const s3Url = `https://s3.us-east-1.amazonaws.com/crmcustoms.site/${imagePath}`;
    console.log(`S3 proxy: Fetching from: ${s3Url}`);
    
    // Делаем запрос к S3
    const s3Request = https.get(s3Url, (s3Response) => {
      // Проверяем статус ответа
      if (s3Response.statusCode !== 200) {
        console.error(`S3 proxy: Error fetching image, status: ${s3Response.statusCode}`);
        res.statusCode = s3Response.statusCode;
        res.end(`Error fetching image: ${s3Response.statusCode}`);
        return;
      }
      
      // Устанавливаем заголовки
      res.setHeader('Content-Type', s3Response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      
      // Передаем данные
      s3Response.pipe(res);
    });
    
    s3Request.on('error', (error) => {
      console.error(`S3 proxy: Request error: ${error.message}`);
      res.statusCode = 500;
      res.end(`Error fetching image: ${error.message}`);
    });
    
    s3Request.end();
  } catch (error) {
    console.error(`S3 proxy: Error: ${error.message}`);
    res.statusCode = 500;
    res.end(`Server error: ${error.message}`);
  }
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Передаем все запросы в Next.js
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 