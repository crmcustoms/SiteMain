const express = require('express');
const next = require('next');
const path = require('path');
const https = require('https');
const http = require('http');
const { handleS3Proxy } = require('./api-routes'); // Подключаем модуль с обработчиками API

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  const server = express();

  // Обслуживаем статические файлы из папки public
  server.use('/images', express.static(path.join(__dirname, 'public/images')));
  server.use('/favicons', express.static(path.join(__dirname, 'public/favicons')));
  server.use('/img', express.static(path.join(__dirname, 'public/img')));
  server.use(express.static(path.join(__dirname, 'public')));
  
  // Проксирование запросов к S3 (обрабатываем оба маршрута)
  server.get('/s3-proxy/:key', (req, res) => {
    console.log(`Express server: Handling S3 proxy request via /s3-proxy/${req.params.key}`);
    // Создаем объект запроса, совместимый с нашим обработчиком
    req.url = `/s3-proxy/${req.params.key}`;
    
    // Используем общий обработчик из api-routes.js
    handleS3Proxy(req, res);
  });
  
  // Добавляем обработку запросов к /api/s3-proxy/
  server.get('/api/s3-proxy/:key', (req, res) => {
    console.log(`Express server: Handling S3 proxy request via /api/s3-proxy/${req.params.key}`);
    // Создаем объект запроса, совместимый с нашим обработчиком
    req.url = `/s3-proxy/${req.params.key}`;
    
    // Используем общий обработчик из api-routes.js
    handleS3Proxy(req, res);
  });

  // Проверка работоспособности сервера
  server.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Все остальные запросы обрабатываются Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 