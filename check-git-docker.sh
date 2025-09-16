#!/bin/bash

# Скрипт для проверки наличия Git в Docker-контейнере

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Проверка наличия Git в Docker-контейнере ===${NC}"

# Получаем список запущенных контейнеров
echo -e "${YELLOW}Получаем список запущенных контейнеров...${NC}"
CONTAINERS=$(docker ps --format "{{.ID}} {{.Names}}")

if [ -z "$CONTAINERS" ]; then
    echo -e "${RED}Нет запущенных контейнеров.${NC}"
    exit 1
fi

echo -e "${YELLOW}Запущенные контейнеры:${NC}"
echo "$CONTAINERS"

# Выбор контейнера для проверки
echo -e "${YELLOW}Введите ID или имя контейнера для проверки:${NC}"
read CONTAINER_ID

# Проверяем наличие Git в контейнере
echo -e "${YELLOW}Проверяем наличие Git в контейнере $CONTAINER_ID...${NC}"
if docker exec $CONTAINER_ID which git &> /dev/null; then
    GIT_VERSION=$(docker exec $CONTAINER_ID git --version)
    echo -e "${GREEN}Git установлен в контейнере: $GIT_VERSION${NC}"
else
    echo -e "${RED}Git не установлен в контейнере.${NC}"
    
    # Спрашиваем, хочет ли пользователь установить Git
    echo -e "${YELLOW}Хотите установить Git в контейнер? (y/n)${NC}"
    read INSTALL_GIT
    
    if [ "$INSTALL_GIT" = "y" ]; then
        echo -e "${YELLOW}Устанавливаем Git в контейнер...${NC}"
        
        # Определяем тип контейнера (Alpine или Debian/Ubuntu)
        if docker exec $CONTAINER_ID which apk &> /dev/null; then
            echo -e "${YELLOW}Обнаружен Alpine Linux. Используем apk...${NC}"
            docker exec $CONTAINER_ID apk add --no-cache git
        elif docker exec $CONTAINER_ID which apt-get &> /dev/null; then
            echo -e "${YELLOW}Обнаружен Debian/Ubuntu. Используем apt-get...${NC}"
            docker exec $CONTAINER_ID apt-get update && docker exec $CONTAINER_ID apt-get install -y git
        else
            echo -e "${RED}Не удалось определить тип контейнера. Установите Git вручную.${NC}"
            exit 1
        fi
        
        # Проверяем, успешно ли установлен Git
        if docker exec $CONTAINER_ID which git &> /dev/null; then
            GIT_VERSION=$(docker exec $CONTAINER_ID git --version)
            echo -e "${GREEN}Git успешно установлен: $GIT_VERSION${NC}"
        else
            echo -e "${RED}Не удалось установить Git.${NC}"
        fi
    fi
fi

# Проверяем переменную окружения NEXT_PUBLIC_SKIP_GIT_INFO
echo -e "${YELLOW}Проверяем переменную окружения NEXT_PUBLIC_SKIP_GIT_INFO...${NC}"
if docker exec $CONTAINER_ID sh -c 'echo $NEXT_PUBLIC_SKIP_GIT_INFO' | grep -q "true"; then
    echo -e "${GREEN}Переменная NEXT_PUBLIC_SKIP_GIT_INFO установлена в true.${NC}"
else
    echo -e "${YELLOW}Переменная NEXT_PUBLIC_SKIP_GIT_INFO не установлена или не равна true.${NC}"
    
    # Спрашиваем, хочет ли пользователь установить переменную
    echo -e "${YELLOW}Хотите установить переменную NEXT_PUBLIC_SKIP_GIT_INFO=true? (y/n)${NC}"
    read SET_VAR
    
    if [ "$SET_VAR" = "y" ]; then
        echo -e "${YELLOW}Устанавливаем переменную NEXT_PUBLIC_SKIP_GIT_INFO=true...${NC}"
        docker exec -e NEXT_PUBLIC_SKIP_GIT_INFO=true $CONTAINER_ID sh -c 'echo "export NEXT_PUBLIC_SKIP_GIT_INFO=true" >> /etc/environment'
        echo -e "${GREEN}Переменная NEXT_PUBLIC_SKIP_GIT_INFO установлена в true.${NC}"
    fi
fi

echo -e "${GREEN}=== Проверка завершена! ===${NC}" 