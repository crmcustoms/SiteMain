# Скрипт для сборки и запуска Docker-контейнера

# Остановка и удаление существующего контейнера, если он есть
Write-Host "Останавливаем и удаляем существующий контейнер, если он есть..."
docker stop crmcustoms-site 2>$null
docker rm crmcustoms-site 2>$null

# Сборка образа с тегом crmcustoms-site
Write-Host "Собираем Docker образ..."
docker build -t crmcustoms-site .

# Запуск контейнера с проброшенным портом 3000
Write-Host "Запускаем контейнер..."
docker run -d --name crmcustoms-site -p 3000:3000 crmcustoms-site

# Вывод информации о запущенном контейнере
Write-Host "Контейнер запущен. Проверяем статус..."
docker ps -f name=crmcustoms-site

Write-Host "Сайт доступен по адресу: http://localhost:3000"
Write-Host "Для просмотра логов используйте команду: docker logs -f crmcustoms-site" 