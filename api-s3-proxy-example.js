/**
 * Пример реализации API для прокси S3 изображений
 * Поддерживает кеширование и обработку параметров безопасности AWS
 */

const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Настройки S3
const S3_DOMAINS = [
  's3.amazonaws.com/crmcustoms.site',
  'crmcustoms.site.s3.amazonaws.com',
  's3.us-east-1.amazonaws.com/crmcustoms.site',
  's3.us-west-2.amazonaws.com/crmcustoms.site',
  'crmcustoms.site.s3.us-west-2.amazonaws.com',
  'crmcustoms.site.s3.us-east-1.amazonaws.com'
];

// Настройки кеша
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа
const MAX_CACHE_SIZE = 100; // Максимальное количество изображений в кеше
const TIMEOUT_MS = 15000; // 15 секунд таймаут для запросов
const DEBUG_MODE = true; // Включаем отладку

// Кеш для изображений
const imageCache = new Map();

// Функции логирования
function logDebug(message) {
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [S3-PROXY] [DEBUG] ${message}`);
  }
}

function logError(message, error) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [S3-PROXY] [ERROR] ${message}`, error || '');
}

// Функция для получения запасного изображения
function getFallbackImage(res) {
  try {
    // Путь к запасному изображению
    const fallbackImagePath = path.join(process.cwd(), 'public', 'placeholder.jpg');
    
    logDebug(`Trying to get fallback image from: ${fallbackImagePath}`);
    
    // Проверяем наличие файла
    if (!fs.existsSync(fallbackImagePath)) {
      logError(`Fallback image not found at ${fallbackImagePath}`);
      
      // Если основное запасное изображение не найдено, пробуем альтернативное
      const altFallbackPath = path.join(process.cwd(), 'public', 'placeholder.png');
      if (fs.existsSync(altFallbackPath)) {
        logDebug(`Using alternative fallback image: ${altFallbackPath}`);
        const altFallbackImage = fs.readFileSync(altFallbackPath);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(altFallbackImage);
      }
      
      throw new Error(`Fallback image not found at ${fallbackImagePath}`);
    }
    
    // Читаем файл
    const fallbackImage = fs.readFileSync(fallbackImagePath);
    logDebug(`Fallback image loaded successfully, size: ${fallbackImage.length} bytes`);
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(fallbackImage);
  } catch (error) {
    logError('Error getting fallback image', error);
    
    // Создаем пустое изображение 1x1 пиксель
    const emptyImage = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(emptyImage);
  }
}

// Функция для загрузки изображения из S3
function fetchImageFromS3(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching image from S3: ${url.substring(0, 50)}...`));
    }, TIMEOUT_MS);

    logDebug(`Fetching image from S3: ${url.substring(0, 50)}...`);
    
    // Проверяем, содержит ли URL параметры безопасности AWS
    const hasAwsSecurityParams = url.includes('X-Amz-Algorithm') || 
                               url.includes('X-Amz-Credential') || 
                               url.includes('X-Amz-Date') ||
                               url.includes('X-Amz-Signature');
    
    if (hasAwsSecurityParams) {
      logDebug(`URL содержит параметры безопасности AWS, используем специальную обработку`);
    }

    const req = https.get(url, {
      timeout: TIMEOUT_MS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    }, (res) => {
      const statusCode = res.statusCode || 0;
      logDebug(`S3 response status: ${statusCode} for URL: ${url.substring(0, 50)}...`);
      
      if (statusCode === 301 || statusCode === 302 || statusCode === 307) {
        // Обрабатываем перенаправление
        const location = res.headers.location;
        if (location) {
          logDebug(`Following redirect to: ${location.substring(0, 50)}...`);
          clearTimeout(timeout);
          
          // Рекурсивно вызываем fetchImageFromS3 для нового URL
          fetchImageFromS3(location)
            .then(resolve)
            .catch(reject);
          return;
        }
      }
      
      if (statusCode !== 200) {
        clearTimeout(timeout);
        reject(new Error(`Failed to fetch image from S3: ${statusCode}, URL: ${url.substring(0, 50)}...`));
        return;
      }

      const contentType = res.headers['content-type'] || 'image/jpeg';
      logDebug(`Content-Type from S3: ${contentType}`);
      
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        clearTimeout(timeout);
        const data = Buffer.concat(chunks);
        logDebug(`Successfully fetched image from S3: ${url.substring(0, 50)}..., size: ${data.length} bytes`);
        resolve({ data, contentType });
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      logError(`Error fetching from S3: ${error.message} for URL: ${url.substring(0, 50)}...`, error);
      reject(error);
    });

    req.end();
  });
}

// Прокси для изображений из S3
app.get('/api/s3-proxy/:encodedUrl', async (req, res) => {
  try {
    // Получаем полный URL запроса
    const encodedUrl = req.params.encodedUrl;
    
    // Декодируем URL
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(encodedUrl);
      logDebug(`Decoded path: ${decodedPath}`);
    } catch (e) {
      logError(`Error decoding path: ${encodedUrl}`, e);
      decodedPath = encodedUrl;
    }
    
    logDebug(`Processing request: ${decodedPath}`);
    
    // Проверяем, является ли это полным URL
    let s3Url = decodedPath;
    if (!decodedPath.startsWith('http')) {
      // Если это не полный URL, проверяем, содержит ли он домен S3
      const isS3Path = S3_DOMAINS.some(domain => decodedPath.includes(domain));
      
      if (isS3Path) {
        // Если это путь к S3, добавляем протокол
        s3Url = `https://${decodedPath}`;
        logDebug(`Converted to full URL: ${s3Url}`);
      } else {
        // Если это не S3 URL, возвращаем запасное изображение
        logError(`Invalid S3 path: ${decodedPath}`);
        return getFallbackImage(res);
      }
    }
    
    // Добавляем параметры запроса, если они есть
    if (req.url.includes('?')) {
      const queryString = req.url.split('?')[1];
      // Проверяем, есть ли уже параметры в URL
      if (s3Url.includes('?')) {
        s3Url += `&${queryString}`;
      } else {
        s3Url += `?${queryString}`;
      }
      logDebug(`URL with query params: ${s3Url.substring(0, 50)}...`);
    }
    
    // Проверяем, содержит ли URL параметры безопасности AWS
    const hasAwsSecurityParams = s3Url.includes('X-Amz-Algorithm') || 
                               s3Url.includes('X-Amz-Credential') || 
                               s3Url.includes('X-Amz-Date') ||
                               s3Url.includes('X-Amz-Signature');
    
    if (hasAwsSecurityParams) {
      logDebug(`URL содержит параметры безопасности AWS: ${s3Url.substring(0, 100)}...`);
    }
    
    // Проверяем кеш
    const cacheKey = s3Url;
    if (imageCache.has(cacheKey)) {
      const cachedImage = imageCache.get(cacheKey);
      
      // Проверяем срок действия кеша
      if (Date.now() - cachedImage.timestamp < CACHE_TTL) {
        logDebug(`Cache hit for: ${cacheKey.substring(0, 50)}...`);
        res.setHeader('Content-Type', cachedImage.contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cachedImage.data);
      } else {
        // Удаляем устаревший кеш
        logDebug(`Cache expired for: ${cacheKey.substring(0, 50)}...`);
        imageCache.delete(cacheKey);
      }
    } else {
      logDebug(`Cache miss for: ${cacheKey.substring(0, 50)}...`);
    }
    
    // Загружаем изображение из S3
    try {
      const { data, contentType } = await fetchImageFromS3(s3Url);
      
      // Кешируем изображение
      imageCache.set(cacheKey, {
        data,
        contentType,
        timestamp: Date.now()
      });
      
      // Ограничиваем размер кеша
      if (imageCache.size > MAX_CACHE_SIZE) {
        // Удаляем самый старый элемент
        const oldestKey = [...imageCache.entries()]
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        logDebug(`Cache limit reached, removing oldest item: ${oldestKey.substring(0, 50)}...`);
        imageCache.delete(oldestKey);
      }
      
      // Возвращаем изображение
      logDebug(`Successfully returning image for: ${s3Url.substring(0, 50)}..., size: ${data.length} bytes`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(data);
    } catch (error) {
      logError(`Error fetching image from S3: ${s3Url.substring(0, 50)}...`, error);
      return getFallbackImage(res);
    }
  } catch (error) {
    logError('Error processing request', error);
    return getFallbackImage(res);
  }
});

// Обработка OPTIONS запросов для CORS
app.options('/api/s3-proxy/:encodedUrl', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`S3 proxy server running on port ${PORT}`);
}); 