# 🚀 Швидкий старт: Система бронювання

> **Повна документація:** `docs/booking-system.md`

## ⚡ За 5 хвилин до запуску

### 1. Імпорт n8n workflows
```
Відкрийте n8n → Import from File
Імпортуйте обидва файли з n8n-workflows/
```

### 2. Налаштування credentials в n8n
- Google Calendar OAuth2 - авторизуйтесь
- Замініть `YOUR_*_CREDENTIALS_ID` в workflows
- Активуйте workflows та скопіюйте webhook URLs

### 3. Створіть `.env.local`
```env
N8N_BOOKING_SLOTS_URL=https://...
N8N_BOOKING_CREATE_URL=https://...
GOOGLE_CALENDAR_ID=your@gmail.com # опционально, если ID задаётся в n8n
PLANFIX_ACCOUNT=account
PLANFIX_TOKEN=token
PLANFIX_PROJECT_ID=123
```

### 4. Запуск та перегляд

```bash
# Запустити dev сервер
npm run dev

# Відкрити в браузері
http://localhost:3000
```

**Де подивитись форму:**
- 🏠 Головна сторінка → Hero секція (зверху) → кнопка "ЗАПИСАТИСЯ НА КОНСУЛЬТАЦІЮ"
- 🏠 Головна сторінка → Перед футером → велика секція з кнопкою
- 📄 Будь-яка сторінка послуг (`/landing/*`)

**Щоб подивитись дизайн без налаштування n8n:**
Форма відкриється, але замість реальних слотів побачите помилку (це нормально для демо)

## ✅ Результат

- Кнопка на головній сторінці ✓
- Кнопки на всіх сторінках послуг ✓
- Демо секція перед футером ✓
- Модальне вікно з календарем ✓
- Інтеграція з Планфікс ✓
- Google Meet посилання ✓

## 📤 Як запушити в Git

```bash
git add .
git commit -m "Додано систему бронювання"
git push origin main
```

Детальніше: `GIT_DEPLOY_GUIDE.md`

---

**Детальна інструкція:** `docs/booking-system.md`
