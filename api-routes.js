const https = require('https');

// Конфигурация S3 бакета
const S3_BUCKET_URL = 'https://s3.us-east-1.amazonaws.com/crmcustoms.site';
// Альтернативные URL для S3 бакета
const ALTERNATIVE_S3_URLS = [
  'https://crmcustoms.site.s3.amazonaws.com',
  'https://s3.amazonaws.com/crmcustoms.site',
  'https://crmcustoms.site.s3.us-east-1.amazonaws.com'
];

// Обработчик для S3 прокси
function handleS3Proxy(req, res) {
  const pathname = req.url.split('?')[0];
  
  if (!pathname.startsWith('/s3-proxy/')) {
    return false;
  }
  
  const key = pathname.replace('/s3-proxy/', '');
  
  // Проверка на пустой ключ
  if (!key || key === '') {
    console.error('S3 Proxy: Пустой ключ файла');
    res.writeHead(302, { 'Location': '/placeholder.jpg' });
    res.end();
    return true;
  }
  
  // Декодируем URL, если он закодирован
  const decodedKey = decodeURIComponent(key);
  console.log(`S3 Proxy: Обработка запроса для ключа: ${decodedKey}`);
  
  const s3Url = `${S3_BUCKET_URL}/${decodedKey}`;
  
  console.log(`S3 Proxy: Запрос к основному URL: ${s3Url}`);
  
  // Функция для обработки ошибок и попытки использования альтернативных URL
  const tryAlternativeUrls = (index = 0) => {
    // Список альтернативных URL для S3
    const alternativeUrls = ALTERNATIVE_S3_URLS.map(baseUrl => `${baseUrl}/${decodedKey}`);
    
    if (index >= alternativeUrls.length) {
      console.error(`S3 Proxy: Все URL не сработали для ${decodedKey}`);
      res.writeHead(302, { 'Location': '/placeholder.jpg' });
      res.end();
      return;
    }
    
    const alternativeUrl = alternativeUrls[index];
    console.log(`S3 Proxy: Пробуем альтернативный URL ${index+1}: ${alternativeUrl}`);
    
    const request = https.get(alternativeUrl, (s3Response) => {
      if (s3Response.statusCode === 200) {
        console.log(`S3 Proxy: Успешно получили из альтернативного URL: ${alternativeUrl}`);
        
        // Устанавливаем правильные заголовки
        res.writeHead(200, {
          'Content-Type': s3Response.headers['content-type'] || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        });
        
        // Передаем данные от S3 клиенту
        s3Response.pipe(res);
      } else {
        console.error(`S3 Proxy: Альтернативный URL ${index+1} не сработал, статус ${s3Response.statusCode}`);
        // Пробуем следующий URL
        tryAlternativeUrls(index + 1);
      }
    });
    
    request.on('error', (err) => {
      console.error(`S3 Proxy: Ошибка с альтернативным URL ${index+1}: ${err.message}`);
      // Пробуем следующий URL
      tryAlternativeUrls(index + 1);
    });
    
    // Устанавливаем таймаут для запроса
    request.setTimeout(5000, () => {
      console.error(`S3 Proxy: Таймаут для альтернативного URL ${index+1}`);
      request.abort();
      tryAlternativeUrls(index + 1);
    });
  };
  
  // Пытаемся получить изображение из основного URL
  const request = https.get(s3Url, (s3Response) => {
    if (s3Response.statusCode === 200) {
      console.log(`S3 Proxy: Успешно получили из основного URL: ${s3Url}`);
      
      // Если успешно получили изображение, возвращаем его
      const contentType = s3Response.headers['content-type'] || 'image/jpeg';
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*'
      });
      
      // Передаем данные от S3 клиенту
      s3Response.pipe(res);
    } else {
      console.error(`S3 Proxy: Основной URL не сработал, статус ${s3Response.statusCode}`);
      // Если основной URL не сработал, пробуем альтернативные
      tryAlternativeUrls();
    }
  });
  
  request.on('error', (err) => {
    console.error(`S3 Proxy: Ошибка с основным URL: ${err.message}`);
    // При ошибке пробуем альтернативные URL
    tryAlternativeUrls();
  });
  
  // Устанавливаем таймаут для запроса
  request.setTimeout(5000, () => {
    console.error(`S3 Proxy: Таймаут для основного URL`);
    request.abort();
    tryAlternativeUrls();
  });
  
  return true;
}

module.exports = {
  handleS3Proxy
}; 