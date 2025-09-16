# Скрипт для остановки всех процессов на порту 3000

Write-Host "Stopping all processes on port 3000..." -ForegroundColor Yellow

# Находим все процессы, использующие порт 3000
$processes = netstat -ano | findstr :3000

if ($processes) {
    Write-Host "Found processes using port 3000:" -ForegroundColor Cyan
    $processes | ForEach-Object {
        $line = $_.Trim()
        Write-Host $line -ForegroundColor Gray
        
        # Извлекаем PID процесса
        $processPID = $line -replace '.*\s+(\d+)$', '$1'
        
        if ($processPID -match '^\d+$') {
            # Получаем информацию о процессе
            $processInfo = Get-Process -Id $processPID -ErrorAction SilentlyContinue
            
            if ($processInfo) {
                Write-Host "Stopping process: $($processInfo.ProcessName) (PID: $processPID)" -ForegroundColor Red
                
                # Останавливаем процесс
                Stop-Process -Id $processPID -Force -ErrorAction SilentlyContinue
                
                if ($?) {
                    Write-Host "Process stopped successfully." -ForegroundColor Green
                } else {
                    Write-Host "Failed to stop process. Try running as Administrator." -ForegroundColor Red
                }
            }
        }
    }
} else {
    Write-Host "No processes found using port 3000." -ForegroundColor Green
}

# Останавливаем все процессы Node.js
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue

Write-Host "All servers stopped." -ForegroundColor Green 