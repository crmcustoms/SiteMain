# Скрипт для деплоя исправлений проблемы с изображениями
# Автор: Claude 3.7 Sonnet
# Дата: 2023-11-12

Write-Host "Начинаю процесс деплоя исправлений для проблемы с изображениями..." -ForegroundColor Green

# Проверяем наличие всех необходимых файлов
$requiredFiles = @(
    "components/blog/blog-detail.tsx",
    "components/landing/static-case-detail.jsx",
    "app/api/s3-proxy/route.ts"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "ОШИБКА: Файл $file не найден!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "Некоторые необходимые файлы отсутствуют. Деплой прерван." -ForegroundColor Red
    exit 1
}

# Создаем резервные копии файлов
Write-Host "Создаю резервные копии файлов..." -ForegroundColor Yellow

$backupFolder = "backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

foreach ($file in $requiredFiles) {
    $fileName = Split-Path $file -Leaf
    $dirName = Split-Path $file -Parent
    $backupPath = Join-Path $backupFolder $dirName
    
    # Создаем структуру папок в бэкапе
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    }
    
    # Копируем файл
    Copy-Item $file -Destination (Join-Path $backupPath $fileName) -Force
    Write-Host "  Создана резервная копия: $file" -ForegroundColor Gray
}

# Запускаем сборку проекта
Write-Host "Запускаю сборку проекта..." -ForegroundColor Yellow
npm run build

# Проверяем результат сборки
if ($LASTEXITCODE -ne 0) {
    Write-Host "ОШИБКА: Сборка проекта завершилась с ошибками!" -ForegroundColor Red
    Write-Host "Восстанавливаю файлы из резервных копий..." -ForegroundColor Yellow
    
    foreach ($file in $requiredFiles) {
        $fileName = Split-Path $file -Leaf
        $dirName = Split-Path $file -Parent
        $backupPath = Join-Path $backupFolder $dirName $fileName
        
        Copy-Item $backupPath -Destination $file -Force
        Write-Host "  Восстановлен файл: $file" -ForegroundColor Gray
    }
    
    exit 1
}

Write-Host "Сборка проекта успешно завершена!" -ForegroundColor Green

# Создаем архив для деплоя
Write-Host "Создаю архив для деплоя..." -ForegroundColor Yellow
$deployFolder = "deploy-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
New-Item -ItemType Directory -Path $deployFolder -Force | Out-Null

# Копируем необходимые файлы и папки для деплоя
$deployItems = @(
    ".next",
    "public",
    "package.json",
    "next.config.mjs"
)

foreach ($item in $deployItems) {
    if (Test-Path $item) {
        Copy-Item $item -Destination $deployFolder -Recurse -Force
        Write-Host "  Скопирован элемент: $item" -ForegroundColor Gray
    } else {
        Write-Host "  ПРЕДУПРЕЖДЕНИЕ: Элемент $item не найден" -ForegroundColor Yellow
    }
}

# Создаем архив
$zipFile = "$deployFolder.zip"
Compress-Archive -Path "$deployFolder\*" -DestinationPath $zipFile -Force

Write-Host "Архив для деплоя создан: $zipFile" -ForegroundColor Green
Write-Host "Документация по исправлениям: docs/fixed-images.md" -ForegroundColor Green

Write-Host "Процесс деплоя завершен успешно!" -ForegroundColor Green
Write-Host "Теперь вы можете загрузить архив $zipFile на сервер." -ForegroundColor Green 