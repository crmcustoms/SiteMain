.\step1-check-current-state.ps1# Step 1: Check current state

Write-Host "=== Checking current project state ===" -ForegroundColor Green

Write-Host ""
Write-Host "Checking Git repository..." -ForegroundColor Yellow

# Check Git
if (Test-Path ".git") {
    Write-Host "Git repository found" -ForegroundColor Green
    
    # Check remote
    $remotes = git remote -v 2>$null
    if ($remotes) {
        Write-Host "Remote repositories:" -ForegroundColor Cyan
        $remotes | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Host "No remote repositories configured" -ForegroundColor Yellow
    }
    
    # Check status
    $status = git status --porcelain 2>$null
    if ($status) {
        Write-Host "Uncommitted changes found:" -ForegroundColor Yellow
        git status --short
    } else {
        Write-Host "Working directory is clean" -ForegroundColor Green
    }
} else {
    Write-Host "Git repository not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking Docker..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "Docker installed: $dockerVersion" -ForegroundColor Green
        
        # Check running containers
        $containers = docker ps --format "table {{.Names}}`t{{.Image}}`t{{.Status}}`t{{.Ports}}" 2>$null
        if ($containers) {
            Write-Host "Running containers:" -ForegroundColor Cyan
            $containers | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        } else {
            Write-Host "No running containers" -ForegroundColor Gray
        }
        
        # Check project images
        $images = docker images --filter "reference=*sitemain*" --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}" 2>$null
        if ($images) {
            Write-Host "Project images:" -ForegroundColor Cyan
            $images | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        }
    } else {
        Write-Host "Docker not found" -ForegroundColor Red
    }
} catch {
    Write-Host "Docker problem: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking project files..." -ForegroundColor Yellow

# Check key files
$files = @(
    @{ path = "package.json"; name = "Package.json" },
    @{ path = "next.config.mjs"; name = "Next.js config" },
    @{ path = "Dockerfile"; name = "Dockerfile" },
    @{ path = ".dockerignore"; name = "Docker ignore" },
    @{ path = ".github/workflows"; name = "GitHub Actions" }
)

foreach ($file in $files) {
    if (Test-Path $file.path) {
        Write-Host "  Found: $($file.name)" -ForegroundColor Green
    } else {
        Write-Host "  Missing: $($file.name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking website availability..." -ForegroundColor Yellow

# Check running containers on ports
$ports = @(3000, 3001, 8080, 80)
foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "  Website available at http://localhost:$port" -ForegroundColor Green
        
        # Check health endpoint if exists
        try {
            $health = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -TimeoutSec 3 -ErrorAction Stop
            if ($health.StatusCode -eq 200) {
                Write-Host "    Health check working" -ForegroundColor Green
            }
        } catch {
            Write-Host "    Health check not available" -ForegroundColor Gray
        }
        break
    } catch {
        # Port not available, continue searching
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the output above" -ForegroundColor White
Write-Host "2. Tell me which port your website uses" -ForegroundColor White
Write-Host "3. Confirm if you have access to GitHub repository" -ForegroundColor White
Write-Host "4. Let me know if you want to set up automatic deployment" -ForegroundColor White
Write-Host ""
Write-Host "Please run this script and share the results!" -ForegroundColor Yellow