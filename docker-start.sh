#!/bin/bash

# Скрипт для сборки и запуска Docker-контейнера на Linux

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "Ошибка: Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Остановка и удаление существующего контейнера, если он есть
echo "Останавливаем и удаляем существующий контейнер, если он есть..."
docker stop crmcustoms-site 2>/dev/null
docker rm crmcustoms-site 2>/dev/null

# Сборка образа с тегом crmcustoms-site
echo "Собираем Docker образ..."
if ! docker build -t crmcustoms-site . --progress=plain; then
    echo "Ошибка: Не удалось собрать Docker образ."
    exit 1
fi

# Запуск контейнера с проброшенным портом 3000
echo "Запускаем контейнер..."
if ! docker run -d --name crmcustoms-site -p 3000:3000 crmcustoms-site; then
    echo "Ошибка: Не удалось запустить контейнер."
    exit 1
fi

# Вывод информации о запущенном контейнере
echo "Контейнер запущен. Проверяем статус..."
docker ps -f name=crmcustoms-site

echo "Сайт доступен по адресу: http://localhost:3000"
echo "Для просмотра логов используйте команду: docker logs -f crmcustoms-site"

# Проверка доступности сайта
echo "Проверка доступности сайта..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
    echo "Сайт успешно запущен и доступен!"
else
    echo "Внимание: Сайт может быть недоступен. Проверьте логи: docker logs crmcustoms-site"
fi 