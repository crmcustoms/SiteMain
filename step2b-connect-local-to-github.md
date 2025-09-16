# Step 2B: Подключение локального кода к GitHub

## Что делаем:
Подключаем ваш локальный код к созданному репозиторию GitHub.

## Репозиторий: 
https://github.com/crmcustoms/SiteMain.git

## Команды для выполнения:

### 1. Добавляем remote репозиторий
```bash
git remote add origin https://github.com/crmcustoms/SiteMain.git
```

### 2. Проверяем что remote добавлен
```bash
git remote -v
```

### 3. Создаем первый коммит (если нужно)
```bash
git add .
git commit -m "Initial commit: Next.js project with Docker setup"
```

### 4. Загружаем код в GitHub
```bash
git push -u origin main
```

## Возможные проблемы:

**Если Git попросит авторизацию:**
- Используйте Personal Access Token вместо пароля
- Или настройте SSH ключи

**Если ветка называется не "main":**
- Проверьте: `git branch`
- Переименуйте если нужно: `git branch -M main`

## Следующий шаг:
После успешной загрузки переходим к **Step 3: Настройка автоматического деплоя на Hetzner**

---
**Готовы выполнить команды? Я помогу с каждой командой по очереди.**