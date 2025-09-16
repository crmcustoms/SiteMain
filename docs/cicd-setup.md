# CI/CD Setup для автоматического деплоя

## Обзор

Настроен полный CI/CD pipeline для автоматического деплоя сайта с GitHub в Docker. При каждом push в main/master ветку происходит:

1. 🔧 **Автоматическая сборка** Docker образа
2. 📦 **Публикация** в GitHub Container Registry  
3. 🚀 **Автоматический деплой** на сервер
4. ✅ **Health check** для проверки успешности деплоя

## Быстрый старт

### 1. Первоначальная настройка

```powershell
# Инициализация GitHub репозитория и CI/CD
.\setup-github-cicd.ps1
```

### 2. Настройка секретов в GitHub

Перейдите в `Repository Settings → Secrets and variables → Actions` и добавьте:

| Секрет | Описание | Пример |
|--------|----------|---------|
| `HOST` | IP адрес сервера | `192.168.1.100` |
| `USERNAME` | Пользователь для SSH | `ubuntu` |
| `SSH_KEY` | Приватный SSH ключ | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PORT` | SSH порт | `22` |

### 3. Деплой изменений

```powershell
# Быстрый деплой
.\deploy-to-github.ps1 "Описание изменений"

# Принудительный деплой без изменений
.\deploy-to-github.ps1 -Force
```

## Подробная настройка

### Подготовка сервера

Убедитесь, что на сервере установлен Docker:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER
```

### Настройка SSH ключей

1. **Создание SSH ключа** (если нет):
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

2. **Добавление публичного ключа на сервер**:
```bash
ssh-copy-id username@your-server-ip
```

3. **Копирование приватного ключа** в GitHub Secrets:
```bash
cat ~/.ssh/id_rsa
```

### GitHub Container Registry

Образы автоматически публикуются в GitHub Container Registry по адресу:
```
ghcr.io/your-username/repository-name:latest
```

## Workflow процесс

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

**Этап 1: Build and Push**
- ✅ Checkout кода
- ✅ Установка Node.js 22
- ✅ Установка зависимостей
- ✅ Запуск тестов (если есть)
- ✅ Сборка приложения
- ✅ Сборка Docker образа
- ✅ Публикация в GitHub Container Registry

**Этап 2: Deploy** (только для main/master)
- ✅ SSH подключение к серверу
- ✅ Остановка старого контейнера
- ✅ Загрузка нового образа
- ✅ Запуск нового контейнера
- ✅ Очистка старых образов

### Локальное тестирование

Перед деплоем можно протестировать сборку локально:

```powershell
# Тест Docker сборки
.\test-docker-build.ps1
```

Этот скрипт:
- Собирает Docker образ локально
- Запускает контейнер на порту 3001
- Проверяет health check
- Тестирует основные страницы

## Мониторинг и отладка

### Health Check Endpoint

Доступен по адресу `/api/health`:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "memory": {
    "used": 45,
    "total": 128
  },
  "hostname": "container-host"
}
```

### Логи GitHub Actions

Отслеживайте процесс деплоя:
- GitHub → Repository → Actions
- Выберите последний workflow run
- Просмотрите логи каждого этапа

### Логи на сервере

```bash
# Логи контейнера
docker logs sitemain-app

# Статус контейнера
docker ps | grep sitemain-app

# Перезапуск контейнера
docker restart sitemain-app
```

## Настройка домена

### Nginx прокси (рекомендуется)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL с Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Переменные окружения

### В производстве

Можно добавить переменные окружения в GitHub Actions:

```yaml
docker run -d \
  --name sitemain-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e CUSTOM_VAR=value \
  ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

### Секретные переменные

Добавьте в GitHub Secrets и используйте в workflow:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY: ${{ secrets.API_KEY }}
```

## Масштабирование

### Множественные серверы

Для деплоя на несколько серверов, создайте отдельные jobs в workflow:

```yaml
deploy-server1:
  needs: build-and-push
  runs-on: ubuntu-latest
  steps:
    # деплой на server1

deploy-server2:
  needs: build-and-push
  runs-on: ubuntu-latest
  steps:
    # деплой на server2
```

### Load Balancer

Используйте Nginx или HAProxy для балансировки нагрузки:

```nginx
upstream app_servers {
    server localhost:3000;
    server localhost:3001;
}

server {
    location / {
        proxy_pass http://app_servers;
    }
}
```

## Troubleshooting

### Частые проблемы

**1. SSH ключ не работает**
- Проверьте формат ключа в GitHub Secrets
- Убедитесь, что используется приватный ключ
- Проверьте права на файлы SSH на сервере

**2. Docker образ не собирается**
- Проверьте логи в GitHub Actions
- Протестируйте сборку локально: `.\test-docker-build.ps1`
- Проверьте `.dockerignore` файл

**3. Контейнер не запускается**
- Проверьте логи: `docker logs sitemain-app`
- Убедитесь, что порт 3000 свободен
- Проверьте health check endpoint

**4. Медленная сборка**
- Оптимизируйте `.dockerignore`
- Используйте multi-stage сборку (уже настроена)
- Рассмотрите GitHub Actions cache

### Полезные команды

```bash
# Остановка всех контейнеров проекта
docker stop $(docker ps -q --filter "name=sitemain")

# Очистка всех образов проекта
docker rmi $(docker images -q "*sitemain*")

# Полная очистка Docker
docker system prune -a

# Мониторинг ресурсов
docker stats sitemain-app
```

## Планы улучшения

- [ ] Автоматические тесты перед деплоем
- [ ] Rollback при ошибках деплоя
- [ ] Slack/Discord уведомления
- [ ] Staging окружение
- [ ] Database migrations
- [ ] Blue-green деплоймент