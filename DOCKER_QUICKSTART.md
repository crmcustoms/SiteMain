# 🐳 Швидкий запуск Docker

## TL;DR - Коротко

```bash
# 1. Встановіть та запустіть Docker Desktop
# 2. Запустіть автоматичний скрипт
.\docker-start.ps1

# АБО вручну:
npm run build
docker build -t crmcustoms-web .
docker-compose up -d

# Відкрийте: http://localhost:3000
```

## 🚨 Вирішення вашої проблеми

**Помилка**: `Could not find a production build in the '.next' directory`

**Що було зроблено**:
1. ✅ Додано `output: 'standalone'` в `next.config.mjs`
2. ✅ Переписано Dockerfile з multi-stage збіркою  
3. ✅ Виправлено копіювання файлів в Docker
4. ✅ Видалено конфліктуючі volume mappings

## 📋 Що у вас є

| Файл | Призначення |
|------|-------------|
| `Dockerfile` | Основний - використовує standalone збірку |
| `Dockerfile.simple` | Запасний - простіший варіант |
| `docker-compose.yml` | Оркестрація контейнерів |
| `docker-start.ps1` | Автоматизований запуск |
| `.dockerignore` | Оптимізація збірки |

## ⚡ Команди

```bash
# Збірка та запуск (автоматично)
.\docker-start.ps1

# Ручна збірка
docker build -t crmcustoms-web .

# Якщо перший не працює
docker build -f Dockerfile.simple -t crmcustoms-web .

# Запуск
docker-compose up -d

# Логи
docker-compose logs -f web

# Зупинка
docker-compose down

# Повне перестворення
docker-compose down
docker rmi crmcustoms-web
.\docker-start.ps1
```

## 🔧 Troubleshooting

### Docker не встановлено
```bash
# Встановіть Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

### Standalone збірка не працює
```bash
# Використайте простий варіант
docker build -f Dockerfile.simple -t crmcustoms-web .
```

### Health check не працює
```yaml
# Закомментуйте в docker-compose.yml
# healthcheck:
#   test: ["CMD", "wget", ...
```

## 🎯 Результат

Після успішного запуску:
- 🌐 Сайт: http://localhost:3000
- 📊 Health check: http://localhost:3000/health
- 📋 Логи: `docker-compose logs -f web`

Проект готовий до публікації! 🚀 