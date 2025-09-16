# Скрипт для тестирования embed-контента в блоге

Write-Host "=== Тестирование Embed-контента ===" -ForegroundColor Green

# Очищаем кеш для получения свежих данных
Write-Host "Очищаем кеш..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "✅ Кеш очищен" -ForegroundColor Green
}

# Запускаем сервер
Write-Host "Запускаем сервер для тестирования..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=== ИНСТРУКЦИИ ПО ТЕСТИРОВАНИЮ EMBED'ОВ ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ТЕСТОВАЯ СТРАНИЦА С РАЗЛИЧНЫМИ EMBED'АМИ:" -ForegroundColor White
Write-Host "   Откройте: http://localhost:3000/test-embeds.html" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ПРОВЕРЬТЕ ВАШУ СТАТЬЮ С SOUNDCLOUD:" -ForegroundColor White
Write-Host "   - Откройте статью с SoundCloud embed'ом" -ForegroundColor Gray
Write-Host "   - Проверьте, отображается ли аудиоплеер" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ОТКРОЙТЕ DEVELOPER TOOLS (F12) -> CONSOLE" -ForegroundColor White
Write-Host "   Ищите сообщения:" -ForegroundColor Gray
Write-Host "   - 'Найдено X iframe'ов в HTML-контенте'" -ForegroundColor Gray
Write-Host "   - 'iframe X: [URL]... загружен успешно'" -ForegroundColor Gray
Write-Host "   - Или ошибки: 'Ошибка загрузки iframe'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. ТИПЫ ПОДДЕРЖИВАЕМЫХ EMBED'ОВ:" -ForegroundColor Yellow
Write-Host "   ✅ SoundCloud (w.soundcloud.com)" -ForegroundColor Green
Write-Host "   ✅ Spotify (open.spotify.com)" -ForegroundColor Green
Write-Host "   ✅ YouTube (youtube.com, youtu.be)" -ForegroundColor Green
Write-Host "   ✅ Vimeo (vimeo.com)" -ForegroundColor Green
Write-Host "   ✅ CodePen (codepen.io)" -ForegroundColor Green
Write-Host "   ✅ Figma (figma.com)" -ForegroundColor Green
Write-Host "   ✅ Twitter/X (twitter.com, x.com)" -ForegroundColor Green
Write-Host "   ✅ Универсальные iframe'ы" -ForegroundColor Green
Write-Host ""
Write-Host "5. ПРОБЛЕМЫ И РЕШЕНИЯ:" -ForegroundColor Red
Write-Host "   Если SoundCloud не отображается:" -ForegroundColor White
Write-Host "   - Проверьте URL в Notion (должен быть embed URL)" -ForegroundColor Gray
Write-Host "   - Убедитесь, что это блок типа 'embed', а не 'video'" -ForegroundColor Gray
Write-Host "   - Проверьте консоль на ошибки CORS" -ForegroundColor Gray
Write-Host ""
Write-Host "Нажмите Ctrl+C чтобы остановить сервер после тестирования" -ForegroundColor Yellow