# Скрипт для публикации сайта в Docker через Git (PowerShell версия)

# Цвета для вывода
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

Write-Host "=== Начинаем процесс публикации сайта через Git ===" -ForegroundColor $Yellow

# Проверяем, установлен ли Git
try {
    $gitVersion = git --version
    Write-Host "Git установлен: $gitVersion" -ForegroundColor $Green
} catch {
    Write-Host "Git не установлен. Пожалуйста, установите Git перед продолжением." -ForegroundColor $Red
    exit 1
}

# Проверяем, есть ли у нас уже инициализированный Git-репозиторий
if (-not (Test-Path ".git")) {
    Write-Host "Инициализируем Git-репозиторий..." -ForegroundColor $Yellow
    git init
}

# Проверяем наличие удаленного репозитория
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "Удаленный репозиторий не настроен." -ForegroundColor $Yellow
    $repoUrl = Read-Host "Введите URL вашего Git-репозитория (например, https://github.com/username/repo.git)"
    git remote add origin $repoUrl
    Write-Host "Удаленный репозиторий настроен: $repoUrl" -ForegroundColor $Green
}

# Добавляем все файлы в индекс
Write-Host "Добавляем изменения в индекс..." -ForegroundColor $Yellow
git add .

# Создаем коммит
Write-Host "Создаем коммит..." -ForegroundColor $Yellow
$commitMessage = Read-Host "Введите сообщение коммита"
git commit -m $commitMessage

# Отправляем изменения в удаленный репозиторий
Write-Host "Отправляем изменения в удаленный репозиторий..." -ForegroundColor $Yellow
git push -u origin main

# Проверяем наличие Docker
try {
    $dockerVersion = docker --version
    Write-Host "Docker установлен: $dockerVersion" -ForegroundColor $Green
} catch {
    Write-Host "Docker не установлен. Пожалуйста, установите Docker перед продолжением." -ForegroundColor $Red
    exit 1
}

# Проверяем наличие docker-compose
try {
    $dockerComposeVersion = docker-compose --version
    Write-Host "Docker Compose установлен: $dockerComposeVersion" -ForegroundColor $Green
} catch {
    Write-Host "Docker Compose не установлен. Пожалуйста, установите Docker Compose перед продолжением." -ForegroundColor $Red
    exit 1
}

# Запускаем Docker-контейнер
Write-Host "Запускаем Docker-контейнер..." -ForegroundColor $Yellow
docker-compose down
docker-compose build
docker-compose up -d

Write-Host "=== Публикация сайта завершена! ===" -ForegroundColor $Green
Write-Host "Сайт доступен по адресу: http://localhost:3000" -ForegroundColor $Green 