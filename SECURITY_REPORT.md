# SECURITY REPORT

Дата: 2026-01-15
Проект: SiteMain

## 1) API endpoints и их защита

- `GET /api/health`
  - Описание: healthcheck.
  - Защита: кеширование на 30 сек; диагностические логи.
- `GET /api/booking/slots`
  - Описание: выдача слотов через n8n webhook.
  - Защита: проверка `startDate`, `endDate`; ошибка при отсутствии конфигурации.
- `POST /api/booking/create`
  - Описание: создание брони через n8n webhook.
  - Защита: проверка обязательных полей, валидация email/телефона, лимит размера запроса.
- `GET /api/s3-proxy/:url`
  - Описание: прокси для изображений.
  - Защита: allowlist доменов (Notion/S3), блок приватных IP, запрет не-HTTP URL.
- `GET /api/notion-image?url=...`
  - Описание: доступ к Notion изображениям.
  - Защита: allowlist доменов (Notion/S3).
- `GET /api/placeholder`
  - Описание: генерация SVG заглушки.
  - Защита: ограничение размеров и экранирование текста (XSS).
- `GET /api/rss`
  - Описание: RSS на базе Notion.
  - Защита: только чтение.
- `GET /api/testimonials`
  - Описание: список отзывов.
  - Защита: только чтение.
- `POST /api/testimonials`
  - Описание: добавление отзыва.
  - Защита: `TESTIMONIALS_API_KEY` через заголовок `x-api-key`.
- `POST /api/analytics/web-vitals`
  - Описание: прием метрик.
  - Защита: допустимые имена метрик, проверка типа, лимит размера запроса.
- `GET /api/test`
  - Описание: тестовый endpoint.
  - Защита: отключен в production (404).

## 2) Места обработки user input

### API (server)
- `app/api/booking/slots/route.ts` — `startDate`, `endDate` из query.
- `app/api/booking/create/route.ts` — JSON body (`date`, `time`, `client*`, и т.д.).
- `app/api/analytics/web-vitals/route.ts` — JSON body (метрики).
- `app/api/testimonials/route.ts` — JSON body (POST).
- `app/api/placeholder/route.ts` — `width`, `height`, `text` из query.
- `app/api/notion-image/route.ts` — `url` из query.
- `app/api/s3-proxy/route.ts` — URL из path + query.

### Клиент (forms)
- `components/landing/hero-section.tsx` — формы обратного звонка/аудита.
- `components/landing/faq.tsx` — форма обратного звонка.
- `components/landing/quiz-section.tsx` — квиз + контакты.
- `components/landing/why-choose-us.tsx` — форма заявки.
- `components/landing/final-cta.tsx` — форма заявки.
- `components/contact-form-dialog.tsx` — форма заявки.
- `components/blog/blog-sidebar.tsx` — форма подписки.
- `components/booking-modal.tsx` — бронирование.

## 3) SQL queries

- Прямых SQL-запросов не найдено.
- Prisma/ORM: есть закомментированный пример в `app/api/analytics/web-vitals/route.ts`.

## 4) Использования eval/exec

- Не найдено.

## 5) Хранение секретов

### Используются переменные окружения
- `NOTION_SECRET` в `lib/notion.ts`
- `N8N_BOOKING_*`, `PLANFIX_*`, `GOOGLE_CALENDAR_ID` в `app/api/booking/*`
- `TESTIMONIALS_API_KEY` в `app/api/testimonials/route.ts`

### Риски
- Переменные `NEXT_PUBLIC_*` не используются для чувствительных данных.
  - Чувствительные токены должны храниться только в серверных env.

## 6) Примечания по безопасности

- SSRF закрыт allowlist-ом доменов (Notion/S3) и блоком приватных IP.
- В `api/placeholder` добавлено экранирование текста для SVG.
- Тестовые/открытые POST ограничены ключом или отключены в prod.

