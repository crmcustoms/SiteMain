# Скрипт для обновления настроек Next.js для поддержки изображений

Write-Host "Updating Next.js configuration for better image support..." -ForegroundColor Green

# Проверяем наличие файла next.config.mjs
$configPath = "next.config.mjs"
if (Test-Path $configPath) {
    Write-Host "Next.js config file found. Checking configuration..." -ForegroundColor Green
    
    $configContent = Get-Content $configPath -Raw
    
    # Проверяем настройки изображений
    $hasImageConfig = $configContent -match "images\s*:\s*\{"
    $hasRemotePatterns = $configContent -match "remotePatterns\s*:\s*\["
    $hasS3Domains = $configContent -match "amazonaws\.com"
    
    if (-not $hasImageConfig -or -not $hasRemotePatterns -or -not $hasS3Domains) {
        Write-Host "Next.js config needs to be updated for better image support." -ForegroundColor Yellow
        
        # Создаем резервную копию
        $backupPath = "$configPath.backup"
        Copy-Item -Path $configPath -Destination $backupPath -Force
        Write-Host "Backup created at $backupPath" -ForegroundColor Green
        
        # Обновляем конфигурацию
        $updatedConfig = $configContent
        
        if (-not $hasImageConfig) {
            # Добавляем базовую конфигурацию изображений
            $imageConfigPattern = "const nextConfig = \{"
            $imageConfigReplacement = @"
const nextConfig = {
  images: {
    domains: ['s3.amazonaws.com', 'crmcustoms.site.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'crmcustoms.site.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/crmcustoms.site/**',
      },
    ],
  },
"@
            $updatedConfig = $updatedConfig -replace $imageConfigPattern, $imageConfigReplacement
        } elseif (-not $hasRemotePatterns) {
            # Добавляем remotePatterns в существующую конфигурацию
            $domainsPattern = "domains:\s*\[[^\]]*\]"
            $domainsReplacement = @"
domains: ['s3.amazonaws.com', 'crmcustoms.site.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'crmcustoms.site.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/crmcustoms.site/**',
      },
    ]
"@
            $updatedConfig = $updatedConfig -replace $domainsPattern, $domainsReplacement
        } elseif (-not $hasS3Domains) {
            # Добавляем домены S3 в существующую конфигурацию
            $remotePatternPattern = "remotePatterns:\s*\["
            $remotePatternReplacement = @"
remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'crmcustoms.site.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/crmcustoms.site/**',
      },
"@
            $updatedConfig = $updatedConfig -replace $remotePatternPattern, $remotePatternReplacement
        }
        
        # Сохраняем обновленную конфигурацию
        Set-Content -Path $configPath -Value $updatedConfig
        Write-Host "Next.js config updated with better image support." -ForegroundColor Green
    } else {
        Write-Host "Next.js config already has proper image support configuration." -ForegroundColor Green
    }
} else {
    Write-Host "Next.js config file not found at $configPath" -ForegroundColor Red
    Write-Host "Creating a new config file with proper image support..." -ForegroundColor Yellow
    
    $newConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s3.amazonaws.com', 'crmcustoms.site.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'crmcustoms.site.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/crmcustoms.site/**',
      },
    ],
  },
  reactStrictMode: true,
}

export default nextConfig
"@
    
    Set-Content -Path $configPath -Value $newConfig
    Write-Host "New Next.js config created with proper image support." -ForegroundColor Green
}

Write-Host ""
Write-Host "Next.js configuration update completed." -ForegroundColor Green
Write-Host "Now you can run the following scripts to apply changes:" -ForegroundColor Yellow
Write-Host "1. .\stop-all-servers.ps1 - to stop all running servers" -ForegroundColor Yellow
Write-Host "2. .\reinstall-dependencies.ps1 - to reinstall dependencies" -ForegroundColor Yellow
Write-Host "3. .\restart-server.ps1 - to restart the server with clean cache" -ForegroundColor Yellow 