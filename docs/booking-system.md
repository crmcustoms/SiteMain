# Система бронирования консультаций

## Обзор

Реализована полноценная система онлайн-бронирования консультаций с интеграциями Google Calendar, Планфікс и автоматической отправкой email.

## Архитектура

```
Клиент (браузер)
    ↓
React компоненты (BookingModal)
    ↓
Next.js API Routes (/api/booking/*)
    ↓
n8n Webhooks
    ├→ Google Calendar API (проверка + создание)
    ├→ Планфікс API (сохранение данных)
    └→ Gmail API (отправка email)
```

## Компоненты

### Frontend (components/)
- `booking-button.tsx` - Кнопка вызова формы
- `booking-modal.tsx` - Главное модальное окно
- `booking-calendar.tsx` - Календарь выбора даты
- `booking-time-slots.tsx` - Сетка временных слотов
- `booking-form.tsx` - Форма с данными клиента
- `booking-success.tsx` - Экран успеха
- `booking-progress.tsx` - Прогресс-бар (1/3, 2/3, 3/3)

### Backend (n8n-workflows/)
- `booking-get-slots.json` - Получение свободных слотов
- `booking-create.json` - Создание бронирования
- `README.md` - Детальная инструкция настройки

### API Routes (app/api/booking/)
- `slots/route.ts` - GET/POST получение слотов
- `create/route.ts` - POST создание бронирования

### Утилиты (lib/)
- `booking-types.ts` - TypeScript типы
- `booking-utils.ts` - Вспомогательные функции

## Интеграции на сайте

Кнопка "Записатися на консультацію" добавлена на:
- Главную страницу (hero секция + final CTA)
- Все 6 страниц услуг (`/landing/*`)

## Настройка

### 1. n8n Workflows

1. Импортируйте оба файла из `n8n-workflows/`
2. Настройте Google Calendar OAuth2 credentials
3. Настройте Gmail OAuth2 credentials
4. Активируйте workflows и скопируйте webhook URLs

### 2. Переменные окружения

Создайте `.env.local`:

```env
# n8n Webhooks
NEXT_PUBLIC_N8N_BOOKING_SLOTS_URL=https://your-n8n.com/webhook/booking-slots
NEXT_PUBLIC_N8N_BOOKING_CREATE_URL=https://your-n8n.com/webhook/booking-create

# Google Calendar
NEXT_PUBLIC_GOOGLE_CALENDAR_ID=your-calendar@gmail.com

# Планфікс
NEXT_PUBLIC_PLANFIX_ACCOUNT=your-account
NEXT_PUBLIC_PLANFIX_TOKEN=your-api-token
NEXT_PUBLIC_PLANFIX_PROJECT_ID=123

# Email
NEXT_PUBLIC_FROM_EMAIL=your-email@gmail.com
```

### Получение данных:

**Google Calendar ID:**
1. Google Calendar → Настройки календаря
2. Интегрировать календарь → ID календаря

**Планфікс API:**
1. Планфікс → Настройки → API
2. Создать новый токен
3. Скопировать ID проекта из URL

## Функциональность

### Для клиентов:
- ✅ Выбор даты и времени из календаря
- ✅ Группировка слотов (утро/день/вечер)
- ✅ Форма с валидацией (имя, email, телефон)
- ✅ Email с подтверждением и Google Meet ссылкой
- ✅ Кнопка "Добавить в календарь" (.ics файл)
- ✅ Адаптивный дизайн для мобильных

### Для администратора:
- ✅ Автоматическая синхронизация с Google Calendar
- ✅ Проверка занятости перед бронированием
- ✅ Сохранение данных клиента в Планфікс
- ✅ Минимум 24 часа до встречи
- ✅ Рабочие часы: 9:00-18:00 (настраивается)
- ✅ Исключение выходных дней

## UX особенности

**Прогресс:**
```
Шаг 1/3: Выберите дату
Шаг 2/3: Выберите время  
Шаг 3/3: Ваши данные
Готово! ✓
```

**Визуализация:**
- Доступные дни подсвечены
- Показывается количество свободных слотов
- Группировка: 🌅 Утро / ☀️ День / 🌆 Вечер
- Плавные анимации между шагами

## Настройка рабочих часов

В workflow `booking-get-slots.json` можно изменить:

```javascript
const workStart = 9;      // Начало рабочего дня
const workEnd = 18;       // Конец рабочего дня
const duration = 30;      // Длительность слота (минуты)
const minLeadTime = 24;   // Минимум часов до встречи
```

Для исключения выходных:
```javascript
// В функции isWorkingHours
if (day === 0 || day === 6) return false; // Воскресенье и суббота
```

## API Endpoints

**POST /api/booking/slots**
```json
Request:
{
  "startDate": "2026-01-15T00:00:00Z",
  "endDate": "2026-01-22T23:59:59Z"
}

Response:
{
  "success": true,
  "slots": [...],
  "slotsByDate": {...},
  "totalSlots": 42
}
```

**POST /api/booking/create**
```json
Request:
{
  "startDateTime": "2026-01-15T09:00:00Z",
  "endDateTime": "2026-01-15T09:30:00Z",
  "clientName": "Іван Петренко",
  "clientEmail": "ivan@example.com",
  "clientPhone": "+380501234567",
  "notes": "Тема консультації"
}

Response:
{
  "success": true,
  "eventId": "google-event-id",
  "planfixTaskId": "task-id",
  "message": "Бронювання створено"
}
```

## Troubleshooting

### Webhook не отвечает
- Проверьте активность workflow в n8n
- Проверьте URL в `.env.local`
- Просмотрите логи выполнения в n8n

### Не показывает слоты
- Проверьте Google Calendar credentials
- Проверьте ID календаря
- Убедитесь что выбираете будущую дату

### Не создается событие
- Проверьте права доступа к календарю
- Проверьте формат даты/времени в запросе
- Просмотрите логи в n8n

### Не приходит email
- Проверьте Gmail OAuth credentials
- Проверьте email в `NEXT_PUBLIC_FROM_EMAIL`
- Проверьте папку спам

### Не создается задача в Планфікс
- Проверьте API токен
- Проверьте ID проекта
- Убедитесь что токен имеет права на создание задач

## Технологии

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- React 18
- Radix UI (Dialog, Calendar)
- react-day-picker
- react-hook-form + zod
- date-fns
- sonner (toast уведомления)

**Backend:**
- n8n (автоматизация)
- Google Calendar API
- Планфікс API
- Gmail API

## Безопасность

- ✅ Все API ключи в `.env.local` (не в git)
- ✅ Валидация данных на backend
- ✅ Защита от CSRF через Next.js
- ✅ Rate limiting в n8n
- ✅ CORS настроен правильно

## Дальнейшее развитие

Возможные улучшения:
- [ ] SMS уведомления через Twilio
- [ ] Напоминания за час до встречи
- [ ] Возможность переноса/отмены встречи
- [ ] Интеграция с Zoom вместо Google Meet
- [ ] Несколько типов консультаций (30/60/90 минут)
- [ ] Определение часового пояса клиента
- [ ] Интеграция с платежной системой

---

**Статус:** Готово к использованию  
**Дата реализации:** Январь 2026  
**Версия:** 1.0
