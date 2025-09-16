# Step 2E: Подключение к новому репозиторию

## Новый репозиторий: 
https://github.com/crmcustoms/SiteMain.git

## Что делаем:
Удаляем старый remote и подключаемся к новому репозиторию с чистой историей.

## Команды для выполнения:

### 1. Удаляем старый remote
```bash
git remote remove origin
```

### 2. Добавляем новый remote
```bash
git remote add origin https://github.com/crmcustoms/SiteMain.git
```

### 3. Проверяем remote
```bash
git remote -v
```

### 4. Создаем новый коммит с безопасным кодом
```bash
git reset --soft HEAD~1
git commit -m "Initial commit: Next.js project with secure environment variables"
```

### 5. Загружаем в новый репозиторий
```bash
git push -u origin main
```

## Статус:
✅ Секреты убраны из кода
✅ Новый репозиторий создан
⏳ Подключаем к новому репозиторию

---
**Готовы выполнить команды?**