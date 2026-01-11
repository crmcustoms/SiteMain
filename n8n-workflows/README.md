# n8n Workflows для системи бронювання

## Інструкція з налаштування

### 1. Імпорт workflows в n8n

1. Відкрийте ваш n8n instance
2. Натисніть "Import from File" або "Import from URL"
3. Імпортуйте файли:
   - `booking-get-slots.json` - workflow для отримання вільних слотів
   - `booking-create.json` - workflow для створення бронювання

### 2. Налаштування Google Calendar

1. В n8n перейдіть до Credentials
2. Створіть нові credentials типу "Google Calendar OAuth2 API"
3. Слідуйте інструкціям для авторизації
4. Замініть `YOUR_GOOGLE_CALENDAR_CREDENTIALS_ID` в обох workflows на ID ваших credentials
5. Вкажіть ID вашого календаря (можна знайти в налаштуваннях Google Calendar)

### 3. Налаштування Планфікс

Для роботи з Планфікс потрібно:

1. Отримати API токен в налаштуваннях Планфікс
2. Знайти ID проєкту, куди будуть додаватися задачі
3. Ці дані передаються в API запиті з фронтенду

**Приклад запиту до Планфікс API:**
```json
{
  "planfixAccount": "your-account",
  "planfixToken": "your-token",
  "planfixProjectId": "project-id"
}
```

### 4. Налаштування Email (Gmail)

1. В n8n створіть credentials типу "Gmail OAuth2"
2. Авторизуйтесь через Google
3. Замініть `YOUR_GMAIL_CREDENTIALS_ID` в workflow `booking-create.json`

### 5. Активація workflows

1. Відкрийте кожен workflow
2. Натисніть "Active" щоб активувати
3. Скопіюйте URL webhook'ів (вони з'являться після активації)
4. Додайте ці URL в `.env.local` вашого сайту:

```env
NEXT_PUBLIC_N8N_BOOKING_SLOTS_URL=https://your-n8n.com/webhook/booking-slots
NEXT_PUBLIC_N8N_BOOKING_CREATE_URL=https://your-n8n.com/webhook/booking-create
NEXT_PUBLIC_GOOGLE_CALENDAR_ID=your-calendar@gmail.com
NEXT_PUBLIC_PLANFIX_ACCOUNT=your-account
NEXT_PUBLIC_PLANFIX_TOKEN=your-token
NEXT_PUBLIC_PLANFIX_PROJECT_ID=123
NEXT_PUBLIC_FROM_EMAIL=your-email@gmail.com
```

## Структура workflows

### booking-get-slots.json

**Метод:** GET

**Вхідні параметри (Query Parameters):**
```
?calendarId=your-calendar@gmail.com&startDate=2026-01-15T00:00:00Z&endDate=2026-01-22T23:59:59Z
```

**Відповідь:**
```json
{
  "success": true,
  "slots": [
    {
      "date": "2026-01-15",
      "time": "09:00",
      "datetime": "2026-01-15T09:00:00Z",
      "endDatetime": "2026-01-15T09:30:00Z",
      "displayTime": "09:00",
      "period": "morning"
    }
  ],
  "slotsByDate": {
    "2026-01-15": [...]
  },
  "totalSlots": 42
}
```

### booking-create.json

**Метод:** POST

**Вхідні параметри:**
```json
{
  "calendarId": "your-calendar@gmail.com",
  "startDateTime": "2026-01-15T09:00:00Z",
  "endDateTime": "2026-01-15T09:30:00Z",
  "clientName": "Іван Петренко",
  "clientEmail": "ivan@example.com",
  "clientPhone": "+380501234567",
  "notes": "Хочу обговорити впровадження CRM",
  "planfixAccount": "your-account",
  "planfixToken": "your-token",
  "planfixProjectId": "123",
  "fromEmail": "your-email@gmail.com"
}
```

**Відповідь:**
```json
{
  "success": true,
  "eventId": "google-calendar-event-id",
  "planfixTaskId": "planfix-task-id",
  "message": "Бронювання успішно створено"
}
```

## Налаштування робочого часу

В workflow `booking-get-slots.json` в коді можна змінити:

- `workStart = 9` - початок робочого дня (9:00)
- `workEnd = 18` - кінець робочого дня (18:00)
- `duration = 30` - тривалість слоту (30 хвилин)
- `minLeadTime = 24` - мінімум за скільки годин можна бронювати

## Виключення вихідних днів

За замовчуванням виключені субота та неділя. Щоб змінити, відредагуйте функцію `isWorkingHours` в коді.

## Troubleshooting

### Webhook не відповідає
- Перевірте, що workflow активний
- Перевірте URL webhook
- Перегляньте логи виконання в n8n

### Не створюються події в календарі
- Перевірте credentials Google Calendar
- Перевірте права доступу до календаря
- Перевірте формат дати/часу

### Не створюються задачі в Планфікс
- Перевірте API токен
- Перевірте ID проєкту
- Перевірте формат запиту до API Планфікс

### Не відправляються email
- Перевірте Gmail credentials
- Перевірте, чи увімкнена "Less secure app access" (для OAuth2 не потрібно)
- Перевірте email адресу відправника
