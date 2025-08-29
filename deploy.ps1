$OutputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding($true)

# 创建生产环境配置文件
function Create-ProductionEnv {
    param (
        [string]$PublicFrontUrl = "http://localhost:3000/h5game",
        [string]$PublicMinioUrl = "http://localhost:9000",
        [string]$AdminName = "h5game_admin",
    )
    
    Write-Host "🔧 Creating production environment configuration..." -ForegroundColor Cyan
    
    # 生成安全的密码和密钥
    $minioPassword = openssl rand -hex 16
    $defaultPassword = (openssl rand -base64 12) + "1a"
    $authSecret = openssl rand -base64 32
    $adminQQ = Get-Random -Minimum 10000000 -Maximum 19999999 
    # 创建 .env.production 文件
    $envContent = @"
# Production Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Application URLs
NEXT_PUBLIC_FRONT_URL=${PublicFrontUrl}
NEXT_PUBLIC_MINIO_URL=${PublicMinioUrl}

# in dev we use localhost, but in production
# use the bridge network like http://minio:9000
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=${minioPassword}

# NextAuth Configuration
AUTH_SECRET=${authSecret}

# Admin Configuration
ADMIN_QQ=${adminQQ}
ADMIN_NAME=${AdminName}
DEFAULT_PASSWORD=${defaultPassword}

"@
    
    $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "✅ Created .env.production with secure credentials" -ForegroundColor Green
    Write-Host "   Username: $AdminName" -ForegroundColor White
    Write-Host "   Password: $defaultPassword for all new users" -ForegroundColor White
    Write-Host "   Console: http://${Domain}:9001" -ForegroundColor White
}

# 构建 Docker 镜像
function Build-DockerImage {
    try {
        Write-Host "🏗️ Building Docker image..." -ForegroundColor Cyan
        # 构建镜像
        docker build --force-rm -t h5game_platform-frontend:v2.0 .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker image built successfully" -ForegroundColor Green
        } else {
            throw "Docker build failed"
        }
    } catch {
        Write-Host "❌ Failed to build Docker image: $_" -ForegroundColor Red
        exit 1
    }
}

# 启动服务
function Start-Services {
    Write-Host "🚀 Starting services..." -ForegroundColor Cyan
    try {
        # 停止现有服务
        Write-Host "Stopping existing services..." -ForegroundColor Blue
        docker compose --env-file .env.production down -v --remove-orphans
        
        # 启动服务
        Write-Host "Starting new services..." -ForegroundColor Blue
        docker compose --env-file .env.production up -d
    } catch {
        Write-Host "❌ Failed to start services: $_" -ForegroundColor Red
        exit 1
    }
}

# 主部署函数
function Deploy-Production {
    param (
        [string]$PublicFrontUrl = "http://localhost:3000/h5game",
        [string]$PublicMinioUrl = "http://localhost:9000",
        [string]$AdminName = "h5game_admin",
        [switch]$SkipBuild,
        [switch]$Force
    )
    
    Write-Host "🚀 H5 Game Platform - Production Deployment" -ForegroundColor Magenta
    Write-Host "===========================================" -ForegroundColor Magenta
    
    # 检查先决条件
    Check-Prerequisites
    
    # 检查是否已有生产环境文件
    if (Test-Path ".env.production" -and !$Force) {
        $response = Read-Host "Production environment file already exists. Overwrite? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "Using existing .env.production file" -ForegroundColor Yellow
        } else {
            Create-ProductionEnv -PublicFrontUrl $PublicFrontUrl -PublicMinioUrl $PublicMinioUrl -AdminName $AdminName
        }
    } else {
        Create-ProductionEnv -PublicFrontUrl $PublicFrontUrl -PublicMinioUrl $PublicMinioUrl -AdminName $AdminName
    }
    
    # 构建镜像
    if (!$SkipBuild) {
        Build-DockerImage
    } else {
        Write-Host "⏭️ Skipping Docker build" -ForegroundColor Yellow
    }
    # 启动服务
    Start-Services
    # 显示状态
    Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "💡 To stop services, run: docker compose --env-file .env.production down" -ForegroundColor Blue
}

# 清理函数
function Clean-Deployment {
    Write-Host "🧹 Cleaning up deployment..." -ForegroundColor Cyan
    # 停止并删除容器
    docker compose --env-file .env.production down --remove-orphans --volumes
    # 删除镜像
    $response = Read-Host "Do you want to remove Docker images as well? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        docker image rm h5game_platform-frontend:v2.0 -f
        Write-Host "✅ Docker images removed" -ForegroundColor Green
    }
    Write-Host "✅ Cleanup completed" -ForegroundColor Green
}

# 主入口点
param (
    [Parameter(Position=0)]
    [ValidateSet("deploy", "clean")]
    [string]$Command = "deploy",
    [string]$PublicFrontUrl = "http://localhost:3000/h5game",
    [string]$PublicMinioUrl = "http://localhost:9000",
    [string]$AdminName = "h5game_admin",
    [switch]$SkipBuild,
    [switch]$Force
)

switch ($Command.ToLower()) {
    "deploy" {
        Deploy-Production -PublicFrontUrl $PublicFrontUrl -PublicMinioUrl $PublicMinioUrl -AdminName $AdminName -SkipBuild:$SkipBuild -Force:$Force
    }
    "clean" {
        Clean-Deployment
    }
}
