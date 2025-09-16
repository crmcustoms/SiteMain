# Скрипт для инициализации GitHub репозитория и настройки CI/CD

Write-Host "=== Настройка GitHub CI/CD для автоматического деплоя ===" -ForegroundColor Green

# Проверяем, установлен ли Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен. Установите Git и повторите попытку." -ForegroundColor Red
    exit 1
}

# Проверяем, установлен ли GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI не установлен." -ForegroundColor Red
    Write-Host "Установите GitHub CLI: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "Или создайте репозиторий вручную на GitHub.com" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Инициализация локального Git репозитория..." -ForegroundColor Yellow

# Инициализируем Git репозиторий, если еще не инициализирован
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git репозиторий инициализирован" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Git репозиторий уже существует" -ForegroundColor Gray
}

# Создаем .gitignore если его нет
if (-not (Test-Path ".gitignore")) {
    @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
.nyc_output

# Cache directories
.npm/
.eslintcache
.next/cache/

# TypeScript
*.tsbuildinfo
.tsc/

# PowerShell scripts (если нужно исключить)
# *.ps1

# Temporary files
tmp/
temp/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✅ .gitignore создан" -ForegroundColor Green
}

# Добавляем все файлы
git add .

# Создаем первый commit
$commitExists = git log --oneline -n 1 2>$null
if (-not $commitExists) {
    git commit -m "Initial commit: Next.js project with Docker CI/CD setup"
    Write-Host "✅ Первый commit создан" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Создание GitHub репозитория..." -ForegroundColor Yellow

# Получаем имя текущей папки для названия репозитория
$repoName = (Get-Item .).Name

try {
    # Проверяем, авторизованы ли мы в GitHub CLI
    $user = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Не авторизованы в GitHub CLI" -ForegroundColor Red
        Write-Host "Выполните: gh auth login" -ForegroundColor Yellow
        exit 1
    }

    # Создаем репозиторий на GitHub
    gh repo create $repoName --public --source=. --remote=origin --push

    Write-Host "✅ GitHub репозиторий создан и код загружен!" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка при создании репозитория: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Создайте репозиторий вручную на https://github.com/new" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔑 Настройка секретов для деплоя..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Для автоматического деплоя на ваш сервер, добавьте следующие секреты в GitHub:" -ForegroundColor White
Write-Host "Repository Settings → Secrets and variables → Actions → New repository secret" -ForegroundColor Gray
Write-Host ""
Write-Host "Необходимые секреты:" -ForegroundColor Cyan
Write-Host "  HOST           - IP адрес вашего сервера" -ForegroundColor White
Write-Host "  USERNAME       - имя пользователя для SSH" -ForegroundColor White  
Write-Host "  SSH_KEY        - приватный SSH ключ для доступа к серверу" -ForegroundColor White
Write-Host "  PORT           - SSH порт (обычно 22)" -ForegroundColor White
Write-Host ""

Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Добавьте секреты в GitHub репозиторий" -ForegroundColor White
Write-Host "2. Убедитесь, что на сервере установлен Docker" -ForegroundColor White
Write-Host "3. Сделайте commit и push - деплой запустится автоматически!" -ForegroundColor White
Write-Host ""
Write-Host "🎉 CI/CD pipeline готов!" -ForegroundColor Green
Write-Host "При каждом push в main/master ветку будет автоматически:" -ForegroundColor White
Write-Host "  • Собираться Docker образ" -ForegroundColor Gray
Write-Host "  • Публиковаться в GitHub Container Registry" -ForegroundColor Gray  
Write-Host "  • Разворачиваться на вашем сервере" -ForegroundColor Gray