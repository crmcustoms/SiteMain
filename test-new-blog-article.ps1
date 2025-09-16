# Скрипт для тестирования новой статьи блога

Write-Host "=== Тестирование новой статьи блога ===" -ForegroundColor Green

# Очищаем кеш
Write-Host "Очищаем кеш Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "Кеш очищен" -ForegroundColor Green
} else {
    Write-Host "Кеш не найден" -ForegroundColor Gray
}

# Запускаем сервер
Write-Host "Запускаем сервер для тестирования..." -ForegroundColor Yellow
Write-Host "ВНИМАНИЕ: Обратите внимание на логи в консоли!" -ForegroundColor Red

Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=== ИНСТРУКЦИИ ПО ТЕСТИРОВАНИЮ ===" -ForegroundColor Cyan
Write-Host "1. Откройте http://localhost:3000/uk/blog" -ForegroundColor White
Write-Host "2. Найдите новую статью в списке" -ForegroundColor White  
Write-Host "3. Кликните на неё" -ForegroundColor White
Write-Host "4. Откройте Developer Tools (F12) -> Console" -ForegroundColor White
Write-Host "5. Найдите в логах следующие сообщения:" -ForegroundColor White
Write-Host "   - 'Начинаем загрузку статьи блога: [slug]'" -ForegroundColor Gray
Write-Host "   - 'BlogArticlePage: получена статья блога'" -ForegroundColor Gray
Write-Host "   - 'Полные данные статьи:' (JSON)" -ForegroundColor Gray
Write-Host "   - 'getBlogPostContent: запрос контента для статьи блога с ID:'" -ForegroundColor Gray
Write-Host ""
Write-Host "КЛЮЧЕВЫЕ ВОПРОСЫ:" -ForegroundColor Red
Write-Host "- Есть ли у статьи ID в логах?" -ForegroundColor Yellow
Write-Host "- Какая ошибка появляется при запросе контента?" -ForegroundColor Yellow
Write-Host "- Возвращается ли контент от API?" -ForegroundColor Yellow
Write-Host ""
Write-Host "Скопируйте логи из консоли и отправьте их для анализа!" -ForegroundColor Green