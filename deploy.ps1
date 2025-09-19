param (
    [Parameter(Position=0)]
    [ValidateSet("deploy", "clean")]
    [string]$Command,
    [string]$PublicFrontUrl,
    [string]$PublicMinioUrl,
    [string]$FrontPort,
    [string]$MinioPort,
    [string]$MinioConsolePort,
    [string]$AdminName,
    [ValidateSet("production", "test")]
    [string]$NodeEnv,
    [switch]$SkipBuild,
    [switch]$Force
)
# Set encoding after param block
$OutputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding($true)

# Set default values after param block
if (-not $Command) { $Command = "deploy" }
if (-not $PublicFrontUrl) { $PublicFrontUrl = "http://localhost:3000/h5game" }
if (-not $PublicMinioUrl) { $PublicMinioUrl = "http://localhost:9000" }
if (-not $AdminName) { $AdminName = "h5game_admin" }

if (-not $FrontPort) { $FrontPort = 3000 }
if (-not $MinioPort) { $MinioPort = 9000 }
if (-not $MinioConsolePort) { $MinioConsolePort = 9001 }
if (-not $NodeEnv) { $NodeEnv = "test" }

# 创建生产环境配置文件
function Create-ProductionEnv {
    param (
        [string]$PublicFrontUrl,
        [string]$PublicMinioUrl,
        [string]$AdminName,
        [string]$FrontPort,
        [string]$MinioPort,
        [string]$MinioConsolePort,
        [string]$NodeEnv
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
AUTH_TRUST_HOST=true
AUTH_URL=${PublicFrontUrl}

# Admin Configuration
ADMIN_QQ=${adminQQ}
ADMIN_NAME=${AdminName}
DEFAULT_PASSWORD=${defaultPassword}

# internal ports
FRONT_PORT=${FrontPort}
MINIO_PORT=${MinioPort}
MINIO_CONSOLE_PORT=${MinioConsolePort}

# runtime env
NODE_ENV=${NodeEnv}
"@
    
    $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "✅ Created .env.production with secure credentials" -ForegroundColor Green
    Write-Host "   Username: $AdminName" -ForegroundColor White
    Write-Host "   QQ: $adminQQ" -ForegroundColor White
    Write-Host "   Password: $defaultPassword for all new users" -ForegroundColor White
    Write-Host "   NODE_ENV: $NodeEnv" -ForegroundColor White
}

# 构建 Docker 镜像
function Build-DockerImage {
    try {
        Write-Host "🏗️  Building Docker image..." -ForegroundColor Cyan
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
        [string]$PublicFrontUrl,
        [string]$PublicMinioUrl,
        [string]$AdminName,
        [ValidateSet("production", "test")]
        [string]$NodeEnv,
        [switch]$SkipBuild,
        [switch]$Force
    )
    
    Write-Host "🚀 H5 Game Platform - Production Deployment" -ForegroundColor Magenta
    Write-Host "===========================================" -ForegroundColor Magenta
    
    if (!$SkipBuild) {
        # 检查是否已有生产环境文件，注意更换管理员密码必须重新 build，因 sqlite 数据库在 image 中已初始化。
        if ((Test-Path ".env.production") -and (!$Force)) {
            $response = Read-Host "Production environment file already exists. Overwrite? (y/N)"
            if (($response -ne "y") -and ($response -ne "Y")) {
                Write-Host "Using existing .env.production file" -ForegroundColor Yellow
            } else {
                Create-ProductionEnv -PublicFrontUrl $PublicFrontUrl -PublicMinioUrl $PublicMinioUrl -AdminName $AdminName -FrontPort $FrontPort -MinioPort $MinioPort -MinioConsolePort $MinioConsolePort -NodeEnv $NodeEnv
            }
        } else {
            Create-ProductionEnv -PublicFrontUrl $PublicFrontUrl -PublicMinioUrl $PublicMinioUrl -AdminName $AdminName -FrontPort $FrontPort -MinioPort $MinioPort -MinioConsolePort $MinioConsolePort -NodeEnv $NodeEnv
        }

        # 构建镜像
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


switch ($Command.ToLower()) {
    "deploy" {
        Deploy-Production -PublicFrontUrl $PublicFrontUrl -PublicMinioUrl $PublicMinioUrl -AdminName $AdminName -NodeEnv $NodeEnv -SkipBuild:$SkipBuild -Force:$Force
    }
    "clean" {
        Clean-Deployment
    }
}
