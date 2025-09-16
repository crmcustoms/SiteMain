,ktve c j,kj;rfvb# Техническое задание: HTML-версия сайта

## Общее описание

Необходимо создать копию текущего сайта на чистом HTML/CSS/JS без использования фреймворков. Сайт должен иметь тот же дизайн и функциональность, что и оригинальный сайт на Next.js.

## Структура проекта

```
project/
  ├── index.html                # Главная страница
  ├── css/                      # Стили
  │   ├── main.css              # Основные стили
  │   └── tailwind.min.css      # Минифицированный Tailwind CSS
  ├── js/                       # JavaScript файлы
  │   ├── main.js               # Основной JS файл
  │   └── api.js                # Функции для работы с API
  ├── images/                   # Изображения
  ├── blog/                     # Страницы блога
  │   ├── index.html            # Список статей
  │   └── [slug]/               # Шаблон для страниц статей
  ├── cases/                    # Страницы кейсов
  │   ├── index.html            # Список кейсов
  │   └── [slug]/               # Шаблон для страниц кейсов
  └── landing/                  # Лендинги
      ├── audit-crm/            # Аудит CRM
      ├── custom-development/   # Разработка
      ├── implementation-crm/   # Внедрение CRM
      ├── industry-solutions/   # Отраслевые решения
      ├── project-management/   # Управление проектами
      └── support-crm/          # Поддержка CRM
```

## API методы

### 1. Получение данных блога

**Endpoint:** `/api/blog`

**Метод:** GET

**Параметры:**
- `lang` (опционально): Язык (по умолчанию 'ua')
- `limit` (опционально): Количество статей (по умолчанию 10)
- `page` (опционально): Номер страницы (по умолчанию 1)

**Пример ответа:**
```json
{
  "posts": [
    {
      "id": "1",
      "title": "Название статьи",
      "description": "Краткое описание",
      "image": "https://s3.us-east-1.amazonaws.com/crmcustoms.site/blog-image.jpg",
      "slug": "article-slug",
      "date": "2023-05-15"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### 2. Получение данных статьи блога

**Endpoint:** `/api/blog/{slug}`

**Метод:** GET

**Параметры:**
- `lang` (опционально): Язык (по умолчанию 'ua')

**Пример ответа:**
```json
{
  "id": "1",
  "title": "Название статьи",
  "description": "Краткое описание",
  "image": "https://s3.us-east-1.amazonaws.com/crmcustoms.site/blog-image.jpg",
  "content": "<p>HTML-содержимое статьи</p>",
  "date": "2023-05-15",
  "tags": ["CRM", "Автоматизация"],
  "relatedPosts": [
    {
      "id": "2",
      "title": "Связанная статья",
      "slug": "related-article"
    }
  ]
}
```

### 3. Получение данных кейсов

**Endpoint:** `/api/cases`

**Метод:** GET

**Параметры:**
- `lang` (опционально): Язык (по умолчанию 'ua')
- `limit` (опционально): Количество кейсов (по умолчанию 10)
- `page` (опционально): Номер страницы (по умолчанию 1)

**Пример ответа:**
```json
{
  "cases": [
    {
      "id": "1",
      "title": "Название кейса",
      "description": "Краткое описание",
      "image": "https://s3.us-east-1.amazonaws.com/crmcustoms.site/case-image.jpg",
      "slug": "case-slug",
      "industry": "Розничная торговля"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### 4. Получение данных кейса

**Endpoint:** `/api/cases/{slug}`

**Метод:** GET

**Параметры:**
- `lang` (опционально): Язык (по умолчанию 'ua')

**Пример ответа:**
```json
{
  "id": "1",
  "title": "Название кейса",
  "description": "Краткое описание",
  "image": "https://s3.us-east-1.amazonaws.com/crmcustoms.site/case-image.jpg",
  "content": "<p>HTML-содержимое кейса</p>",
  "industry": "Розничная торговля",
  "services": ["Внедрение CRM", "Автоматизация"],
  "tags": ["Retail", "CRM"],
  "relatedCases": [
    {
      "id": "2",
      "title": "Связанный кейс",
      "slug": "related-case"
    }
  ]
}
```

### 5. Прокси для изображений из S3

**Endpoint:** `/api/s3-proxy/{encodedUrl}`

**Метод:** GET

**Параметры:**
- `encodedUrl`: URL-encoded полный URL изображения в S3

**Описание:**
Этот API метод служит прокси для изображений, хранящихся в Amazon S3. Он кеширует изображения на сервере и обрабатывает различные форматы URL.

**Пример использования:**
```html
<img src="/api/s3-proxy/https%3A%2F%2Fs3.us-east-1.amazonaws.com%2Fcrmcustoms.site%2Fimage.jpg" alt="Изображение">
```

### 6. Отправка формы обратной связи

**Endpoint:** `/api/contact`

**Метод:** POST

**Тело запроса:**
```json
{
  "name": "Имя пользователя",
  "email": "user@example.com",
  "phone": "+380991234567",
  "message": "Текст сообщения",
  "subject": "Тема сообщения"
}
```

**Пример ответа:**
```json
{
  "success": true,
  "message": "Сообщение успешно отправлено"
}
```

## Список изображений

### Общие изображения

- Логотип: `/images/logo.svg`
- Фавикон: `/favicon.ico`
- Плейсхолдер: `/placeholder.jpg`
- Фоновое изображение героя: `/images/hero-background.jpg`
- Фоновое изображение с роботом AI: `/images/ai-robot-background.jpeg`

### Изображения для лендингов

#### Аудит CRM
- Герой: `/images/landings/audit/hero.jpg`

#### Разработка
- Герой: `/images/landings/development/hero.jpg`
- Аналитика: `/images/landings/development/analytics.jpg`
- CRM 1C: `/images/landings/development/crm-1c.jpg`
- Мобильное приложение: `/images/landings/development/mobile-app.jpg`

#### Иконки технологий
- AWS: `/images/landings/development/icons/aws.svg`
- Docker: `/images/landings/development/icons/docker.svg`
- Node.js: `/images/landings/development/icons/nodejs.svg`
- PostgreSQL: `/images/landings/development/icons/postgresql.svg`
- Python: `/images/landings/development/icons/python.svg`
- React: `/images/landings/development/icons/react.svg`

#### Внедрение CRM
- Герой: `/images/landings/implementation/hero.jpg`

#### Отраслевые решения
- E-commerce: `/images/landings/industry-solutions/ecommerce.jpg`
- Мебельная индустрия: `/images/landings/industry-solutions/furniture.jpg`
- Промышленность: `/images/landings/industry-solutions/industry.jpg`
- PR-агентство: `/images/landings/industry-solutions/pr-agency.jpg`

#### Управление проектами
- Герой: `/images/landings/project-management/project-management-hero.jpg`
- Retail CRM: `/images/landings/project-management/retail-crm.jpg`

#### Поддержка CRM
- Герой: `/images/landings/support/hero.jpg`

### Изображения для отзывов

- `/images/testimonials/alexander-lihtman.jpg`
- `/images/testimonials/business-owner2.jpg`
- `/images/testimonials/businessman1.jpg`
- `/images/testimonials/businesswoman1.jpg`
- `/images/testimonials/businesswoman2.jpg`
- `/images/testimonials/hr-director.jpg`
- `/images/testimonials/lihtman.jpg`
- `/images/testimonials/Marketolog.jpg`
- `/images/testimonials/Prorab.jpg`

### Изображения для отраслей

- Логистика: `/images/logistics.jpg`
- Производство: `/images/manufacturing.jpg`
- Недвижимость: `/images/realestate.jpg`
- Розничная торговля: `/images/retail.jpg`
- Услуги: `/images/services.jpg`

## Особенности реализации

### 1. Обработка изображений из S3

Для изображений из Amazon S3 необходимо реализовать прокси-сервер, который будет:
- Кешировать изображения для ускорения загрузки
- Обрабатывать различные форматы URL
- Обрабатывать URL с параметрами безопасности AWS (X-Amz-Algorithm, X-Amz-Credential и т.д.)

Пример реализации на Node.js:

```javascript
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
  's3.us-west-2.amazonaws.com/crmcustoms.site'
];

// Кеш для изображений
const imageCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

// Прокси для изображений из S3
app.get('/api/s3-proxy/:encodedUrl', (req, res) => {
  try {
    const encodedUrl = req.params.encodedUrl;
    const url = decodeURIComponent(encodedUrl);
    
    // Проверка кеша
    if (imageCache.has(url)) {
      const { data, contentType, timestamp } = imageCache.get(url);
      if (Date.now() - timestamp < CACHE_TTL) {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(data);
      }
      imageCache.delete(url);
    }
    
    // Загрузка изображения
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return res.status(404).send('Image not found');
      }
      
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const chunks = [];
      
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const data = Buffer.concat(chunks);
        
        // Кешируем изображение
        imageCache.set(url, {
          data,
          contentType,
          timestamp: Date.now()
        });
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(data);
      });
    }).on('error', (err) => {
      console.error('Error fetching image:', err);
      res.status(500).send('Error fetching image');
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Обработка HTML-контента

Для страниц блога и кейсов необходимо обрабатывать HTML-контент:
- Заменять URL изображений из S3 на локальные прокси-URL
- Добавлять обработчики ошибок для изображений
- Обрабатывать относительные пути

Пример функции для обработки HTML:

```javascript
function processHtmlContent(html) {
  if (!html) return '';
  
  try {
    // Заменяем URL изображений из S3 на прокси URL
    let processed = html.replace(
      /(src=[\"'])(https?:\/\/[^\"']*(?:s3\.amazonaws\.com\/crmcustoms\.site|crmcustoms\.site\.s3[^\"']*amazonaws\.com|s3[^\"']*\/crmcustoms\.site|s3[^\"']*crmcustoms\.site)[^\"']+)([\"'])/gi, 
      (match, p1, p2, p3) => {
        try {
          const proxyUrl = `/api/s3-proxy/${encodeURIComponent(p2)}`;
          return `${p1}${proxyUrl}${p3}`;
        } catch (e) {
          console.error('Error processing S3 URL:', e);
          return match;
        }
      }
    );
    
    // Заменяем относительные URL изображений
    processed = processed.replace(
      /(src=[\"'])(?!https?:\/\/)(?!\/api\/s3-proxy\/)([^\"']+)([\"'])/gi,
      (match, p1, p2, p3) => {
        try {
          if (p2.startsWith('/')) {
            return match; // Оставляем абсолютные пути без изменений
          }
          return `${p1}/${p2}${p3}`; // Добавляем слеш к относительным путям
        } catch (e) {
          console.error('Error processing relative URL:', e);
          return match;
        }
      }
    );
    
    // Добавляем обработчики ошибок для изображений
    processed = processed.replace(
      /<img([^>]*)>/gi,
      '<img$1 onerror="this.onerror=null;this.src=\'/placeholder.jpg\';">'
    );
    
    return processed;
  } catch (e) {
    console.error('Error processing HTML content:', e);
    return html;
  }
}
```

## Требования к адаптивности

Сайт должен корректно отображаться на следующих устройствах:

1. Десктоп (1920px и выше)
2. Ноутбук (1366px - 1919px)
3. Планшет (768px - 1365px)
4. Мобильный телефон (320px - 767px)

## Требования к производительности

1. Время загрузки первого контента (FCP): не более 1.8 секунды
2. Время до интерактивности (TTI): не более 3.5 секунд
3. Оценка PageSpeed Insights: не менее 85 баллов для мобильных устройств и 90 баллов для десктопа

## Требования к безопасности

1. Все формы должны иметь защиту от CSRF-атак
2. Все пользовательские данные должны проходить валидацию и санитизацию
3. Использовать HTTPS для всех запросов
4. Добавить соответствующие заголовки безопасности (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options)

## Дополнительные требования

1. Реализовать переключение языков (украинский/русский/английский)
2. Реализовать переключение темы (светлая/темная)
3. Добавить прелоадеры для улучшения пользовательского опыта
4. Реализовать обработку ошибок при загрузке контента
5. Добавить микроразметку Schema.org для улучшения SEO 