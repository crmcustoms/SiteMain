#!/bin/bash

# Скрипт для публикации сайта в Docker через Git

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Начинаем процесс публикации сайта через Git ===${NC}"

# Проверяем, установлен ли Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git не установлен. Устанавливаем Git...${NC}"
    apt-get update && apt-get install -y git
fi

# Проверяем, есть ли у нас уже инициализированный Git-репозиторий
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Инициализируем Git-репозиторий...${NC}"
    git init
fi

# Проверяем наличие удаленного репозитория
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}Удаленный репозиторий не настроен.${NC}"
    echo -e "${YELLOW}Введите URL вашего Git-репозитория (например, https://github.com/username/repo.git):${NC}"
    read REPO_URL
    git remote add origin $REPO_URL
    echo -e "${GREEN}Удаленный репозиторий настроен: $REPO_URL${NC}"
fi

# Добавляем все файлы в индекс
echo -e "${YELLOW}Добавляем изменения в индекс...${NC}"
git add .

# Создаем коммит
echo -e "${YELLOW}Создаем коммит...${NC}"
echo -e "${YELLOW}Введите сообщение коммита:${NC}"
read COMMIT_MESSAGE
git commit -m "$COMMIT_MESSAGE"

# Отправляем изменения в удаленный репозиторий
echo -e "${YELLOW}Отправляем изменения в удаленный репозиторий...${NC}"
git push -u origin main

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен. Пожалуйста, установите Docker перед продолжением.${NC}"
    exit 1
fi

# Проверяем наличие docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}docker-compose не установлен. Пожалуйста, установите docker-compose перед продолжением.${NC}"
    exit 1
fi

# Запускаем Docker-контейнер
echo -e "${YELLOW}Запускаем Docker-контейнер...${NC}"
docker-compose down
docker-compose build
docker-compose up -d

echo -e "${GREEN}=== Публикация сайта завершена! ===${NC}"
echo -e "${GREEN}Сайт доступен по адресу: http://localhost:3000${NC}" 