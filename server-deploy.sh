#!/bin/bash

# Скрипт для автоматического развертывания из Git-репозитория на сервере

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Настройки
REPO_URL="" # URL вашего Git-репозитория
BRANCH="main" # Ветка для клонирования
APP_DIR="/opt/stacks" # Директория для приложения

echo -e "${YELLOW}=== Начинаем процесс развертывания сайта из Git ===${NC}"

# Проверяем, установлен ли Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git не установлен. Устанавливаем Git...${NC}"
    apt-get update && apt-get install -y git
fi

# Проверяем, существует ли директория приложения
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Создаем директорию для приложения: $APP_DIR${NC}"
    mkdir -p $APP_DIR
fi

# Переходим в директорию приложения
cd $APP_DIR

# Проверяем, есть ли уже клонированный репозиторий
if [ -d ".git" ]; then
    echo -e "${YELLOW}Обновляем существующий репозиторий...${NC}"
    git pull origin $BRANCH
else
    # Если репозиторий не указан в настройках, запрашиваем его
    if [ -z "$REPO_URL" ]; then
        echo -e "${YELLOW}Введите URL вашего Git-репозитория (например, https://github.com/username/repo.git):${NC}"
        read REPO_URL
    fi
    
    echo -e "${YELLOW}Клонируем репозиторий из $REPO_URL...${NC}"
    git clone $REPO_URL -b $BRANCH .
fi

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен. Устанавливаем Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Проверяем наличие docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}docker-compose не установлен. Устанавливаем docker-compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/download/v2.24.7/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Запускаем Docker-контейнер
echo -e "${YELLOW}Запускаем Docker-контейнер...${NC}"
docker-compose down
docker-compose build
docker-compose up -d

echo -e "${GREEN}=== Развертывание сайта завершено! ===${NC}"
echo -e "${GREEN}Сайт доступен по адресу: http://localhost:3000${NC}" 