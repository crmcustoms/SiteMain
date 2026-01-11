# 🚀 Швидкий гайд: Git Deploy

## 📦 Запуск проекту локально

```bash
# Встановити залежності (якщо ще не встановлені)
npm install

# Запустити dev сервер
npm run dev
```

Відкрийте http://localhost:3000 в браузері

## 🔄 Зберегти зміни в Git

### 1. Перевірити статус
```bash
git status
```

### 2. Додати всі файли
```bash
git add .
```

### 3. Створити commit
```bash
git commit -m "Додано систему бронювання консультацій"
```

### 4. Запушити на GitHub
```bash
git push origin main
```

Або якщо це перший push:
```bash
git push -u origin main
```

## 🌐 Автоматичний деплой

Якщо налаштований GitHub Actions (файл `.github/workflows/deploy.yml`), то після `git push` сайт автоматично задеплоїться.

## 📝 Швидка команда (все разом)

```bash
git add . && git commit -m "Ваше повідомлення" && git push
```

## ❓ Якщо виникли проблеми

**"Your branch is behind"** - спочатку підтягніть зміни:
```bash
git pull origin main
```

**Конфлікти** - спочатку вирішіть конфлікти, потім:
```bash
git add .
git commit -m "Resolved conflicts"
git push
```

## 📚 Детальна документація

Дивіться файли:
- `ADMIN_DEPLOYMENT_GUIDE.md` - повна інструкція деплою
- `GIT_DOCKER_DEPLOY.md` - деплой через Docker
- `.github/workflows/deploy.yml` - налаштування CI/CD

---

**Repo:** https://github.com/crmcustoms/SiteMain
