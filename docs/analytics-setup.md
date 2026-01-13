# 📊 Налаштування аналітики на сайті

## 🎯 Що підключено

Сайт підтримує 2 безкоштовні системи аналітики:

1. **Google Analytics 4** (GA4) - стандарт веб-аналітики
2. **Microsoft Clarity** - безкоштовний інструмент для аналізу UX (відео сесій, heatmaps)

---

## 📋 Крок 1: Отримати ID для Google Analytics

### 1.1 Створити акаунт Google Analytics

1. Перейдіть на https://analytics.google.com/
2. Натисніть **"Почати"** або увійдіть з Google акаунтом
3. Створіть **Обліковий запис**:
   - Назва облікового запису: `CRM Customs`
   - Налаштування доступу: за замовчуванням

### 1.2 Створити ресурс (Property)

1. Назва ресурсу: `CRM Customs Website`
2. Часовий пояс: `Ukraine (GMT+2)`
3. Валюта: `Ukrainian Hryvnia (₴)`

### 1.3 Налаштувати потік даних

1. Виберіть **"Веб"**
2. URL веб-сайту: `https://crmcustoms.com`
3. Назва потоку: `CRM Customs Website`

### 1.4 Отримати ID вимірювання

Після створення ви побачите **Measurement ID** у форматі: `G-XXXXXXXXXX`

**Збережіть цей ID!** Він буде потрібен у наступному кроці.

---

## 📋 Крок 2: Отримати ID для Microsoft Clarity

### 2.1 Створити акаунт Clarity

1. Перейдіть на https://clarity.microsoft.com/
2. Увійдіть з акаунтом Microsoft (або створіть новий)
3. Натисніть **"Add new project"**

### 2.2 Налаштувати проєкт

1. Назва: `CRM Customs Website`
2. URL: `https://crmcustoms.com`
3. Категорія: `Business Services` або `Technology`

### 2.3 Отримати Project ID

Після створення проєкту ви побачите **Project ID** на сторінці налаштувань.

Формат: `abcdef1234` (10 символів)

**Збережіть цей ID!**

---

## 📋 Крок 3: Додати ID до змінних середовища

### 3.1 Локально (для розробки)

Додайте у файл `.env.local`:

```env
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdef1234
```

### 3.2 На Coolify (для продакшн)

1. Відкрийте Coolify → **Shared Variables** → ваш проєкт
2. Додайте змінні:

   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
     **Value**: `G-XXXXXXXXXX`
     ✅ **Available at Buildtime**

   - **Name**: `NEXT_PUBLIC_CLARITY_PROJECT_ID`
     **Value**: `abcdef1234`
     ✅ **Available at Buildtime**

3. Збережіть зміни
4. Зробіть **Force Rebuild** для проєкту

---

## ✅ Крок 4: Перевірити роботу

### 4.1 Google Analytics

1. Відкрийте https://crmcustoms.com у браузері
2. Відкрийте DevTools (F12) → Console
3. Перевірте чи є `gtag` функція: `typeof gtag`
4. У GA4 перейдіть у **Realtime** → ви маєте побачити свій візит

### 4.2 Microsoft Clarity

1. Відкрийте https://clarity.microsoft.com/
2. Перейдіть у ваш проєкт
3. Через 2-5 хвилин ви маєте побачити першу сесію у **Dashboard**

---

## 📊 Що відстежується

### Google Analytics 4:

- ✅ Перегляди сторінок
- ✅ Події користувачів (автоматично)
- ✅ Джерела трафіку
- ✅ Демографія аудиторії
- ✅ Конверсії (потрібно налаштувати окремо)

### Microsoft Clarity:

- ✅ Відеозаписи сесій користувачів
- ✅ Heatmaps (карти кліків)
- ✅ Скролл-карти
- ✅ Аналіз помилок JavaScript

---

## 🚀 Додаткові налаштування (опціонально)

### Налаштувати цілі у Google Analytics

1. GA4 → **Admin** → **Events**
2. Створіть події для:
   - Відкриття форми бронювання
   - Надсилання форми контактів
   - Клік на кнопку "Пройти діагностику"
   - Перегляд кейсів

### Налаштувати фільтри у Clarity

1. Clarity → **Settings** → **IP blocking**
2. Додайте свою IP-адресу щоб не відстежувати себе

---

## ❌ Видалити аналітику (якщо потрібно)

Якщо з якихось причин потрібно вимкнути аналітику:

1. Видаліть змінні `NEXT_PUBLIC_GA_MEASUREMENT_ID` та `NEXT_PUBLIC_CLARITY_PROJECT_ID`
2. Зробіть rebuild

Скрипти **НЕ** будуть завантажуватись якщо змінні не встановлені.

---

## 📞 Підтримка

Якщо виникли проблеми:
- Google Analytics: https://support.google.com/analytics
- Microsoft Clarity: https://docs.microsoft.com/en-us/clarity/

---

**Готово!** 🎉 Аналітика налаштована та працює!
