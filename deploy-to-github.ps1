# Скрипт для быстрого деплоя изменений через GitHub

param(
    [string]$Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [switch]$Force
)

Write-Host "=== Быстрый деплой через GitHub ===" -ForegroundColor Green

# Проверяем, что мы в Git репозитории
if (-not (Test-Path ".git")) {
    Write-Host "❌ Не найден Git репозиторий. Выполните setup-github-cicd.ps1 сначала." -ForegroundColor Red
    exit 1
}

# Получаем статус Git
$status = git status --porcelain

if (-not $status -and -not $Force) {
    Write-Host "ℹ️ Нет изменений для деплоя" -ForegroundColor Gray
    Write-Host "Используйте -Force для принудительного деплоя" -ForegroundColor Yellow
    exit 0
}

Write-Host "📝 Изменения для деплоя:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "🔄 Добавляем изменения..." -ForegroundColor Yellow
git add .

Write-Host "💾 Создаем commit..." -ForegroundColor Yellow
git commit -m "$Message"

Write-Host "🚀 Отправляем на GitHub (запуск автоматического деплоя)..." -ForegroundColor Yellow
git push origin main 2>$null
if ($LASTEXITCODE -ne 0) {
    git push origin master 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка при push. Проверьте настройки репозитория." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Код отправлен на GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Отслеживание деплоя:" -ForegroundColor Cyan

# Получаем URL репозитория
$remoteUrl = git remote get-url origin
if ($remoteUrl -match "github\.com[:/](.+)/(.+)\.git") {
    $owner = $Matches[1]
    $repo = $Matches[2]
    $actionsUrl = "https://github.com/$owner/$repo/actions"
    Write-Host "  GitHub Actions: $actionsUrl" -ForegroundColor White
}

Write-Host ""
Write-Host "⏱️ Деплой займет ~3-5 минут" -ForegroundColor Yellow
Write-Host "🔄 Процесс:" -ForegroundColor Cyan
Write-Host "  1. Сборка Docker образа (~2-3 мин)" -ForegroundColor Gray
Write-Host "  2. Публикация в GitHub Container Registry (~30 сек)" -ForegroundColor Gray
Write-Host "  3. Деплой на сервер (~1-2 мин)" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 После завершения сайт будет обновлен автоматически!" -ForegroundColor Green