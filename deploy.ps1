# 确保使用UTF-8编码，避免中文乱码
$OutputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding($true)

# 检查OpenSSL是否可用，如果不可用则使用PowerShell替代方法生成随机字符串
function Get-RandomString {
    param (
        [int]$Length = 32
    )
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
    $random = 1..$Length | ForEach-Object { Get-Random -Maximum $chars.Length }
    $private:ofs = ""
    return [String]$chars[$random]
}

# 生成 RSA 密钥对的函数 - 仅使用 OpenSSL
function Generate-RS256KeysWithOpenSSL {
    try {
        # 检查 OpenSSL 是否可用
        $openssl = Get-Command openssl -ErrorAction Stop
        
        # 创建临时文件
        $tempDir = [System.IO.Path]::GetTempPath()
        $privateKeyPath = Join-Path $tempDir "private_$(Get-Date -Format 'yyyyMMddHHmmss').pem"
        $publicKeyPath = Join-Path $tempDir "public_$(Get-Date -Format 'yyyyMMddHHmmss').pem"
        
        # 1. 生成传统格式的 RSA 私钥 (PKCS#1 格式)
        openssl genrsa -out $privateKeyPath 2048
        
        # 2. 从私钥生成公钥（标准格式）
        openssl rsa -in $privateKeyPath -pubout -out $publicKeyPath
        
        # 3. 读取私钥内容（完整PEM）
        $privatePem = (Get-Content -Path $privateKeyPath -Raw).TrimEnd() + "`n"
        
        # 4. 读取公钥内容（完整PEM）
        $publicPem = (Get-Content -Path $publicKeyPath -Raw).TrimEnd() + "`n"
        
        # 5. 转换为Base64编码的字符串
        $privateBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($privatePem))
        $publicBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($publicPem))
        
        # 6. 清理临时文件
        Remove-Item -Path $privateKeyPath -Force
        Remove-Item -Path $publicKeyPath -Force
        
        return @{
            PrivateKeyBase64 = $privateBase64
            PublicKeyBase64  = $publicBase64
            PrivatePem       = $privatePem
            PublicPem        = $publicPem
        }
    }
    catch {
        Write-Host "无法使用OpenSSL生成密钥对: $_" -ForegroundColor Red
        Write-Host "请确保OpenSSL已安装并添加到PATH" -ForegroundColor Red
        exit 1
    }
}
# 尝试使用OpenSSL，失败则回退到PowerShell方法
$envFile = ".env"
if (Test-Path -Path $envFile) {
    Remove-Item -Path $envFile -Force
    Write-Host "File already deleted: $envFile"
}

Add-Type -AssemblyName System.Security.Cryptography

function Get-Sha256String($inputString) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($inputString)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return -join ($hash | ForEach-Object { $_.ToString('x2') })
}

try {
    $rsaKeys = Generate-RS256KeysWithOpenSSL
    $minioPassword = openssl rand -hex 16
    $postgresPassword = openssl rand -hex 20
    $adminPassword = openssl rand -hex 16
    # 检查输出是否有效
    if (-not $minioPassword -or -not $postgresPassword) {
        throw "OpenSSL returned empty result"
    }
    # 计算SHA256哈希
    $adminhash = Get-Sha256String $adminPassword
} catch {
    Write-Host "OpenSSL not found, cannot generate initial password!" -ForegroundColor Red
    # 退出脚本
    exit 1
}

# 创建.env文件，注意四个端口可以取得高一些，放到一起
# 三个 PUBLIC_URL，是最后需要在 nginx 协同配置的，能够供外网访问的 API 地址，建议设计 BACK_URL 为 FRONT_URL/api; MINIO_URL 为 FRONT_URL/assets
@"
BACK_PORT=14399
MINIO_PORT=14400
POSTGRES_PORT=14401
FRONT_PORT=14402
# PUBLIC_FRONT_URL=https://www.qsc.zju.edu.cn/h5game
# PUBLIC_MINIO_URL=https://www.qsc.zju.edu.cn/h5game/assets
# PUBLIC_BACK_URL=https://www.qsc.zju.edu.cn/h5game/api
PUBLIC_FRONT_URL=http://localhost:14402
PUBLIC_MINIO_URL=http://localhost:14400
PUBLIC_BACK_URL=http://localhost:14399
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=$minioPassword
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$postgresPassword
POSTGRES_DB=game_metadata
# ADMIN_PASSWORD=$adminPassword
ADMIN_HASH=$adminhash
RS256_PRIVATE_KEY=$($rsaKeys.PrivateKeyBase64)
RS256_PUBLIC_KEY=$($rsaKeys.PublicKeyBase64)
"@ | Out-File -FilePath .env -Encoding UTF8

# 确保环境变量文件被忽略
if (-not (Test-Path .gitignore)) {
    New-Item .gitignore -ItemType File
}

# 检查.gitignore中是否已包含*.env
if (-not (Get-Content .gitignore | Select-String -Pattern "^\*.env$")) {
    "*.env" | Out-File -FilePath .gitignore -Append -Encoding UTF8
}

# 加载环境变量
$envVars = Get-Content .env | Where-Object { $_ -match '=' } | ForEach-Object {
    $parts = $_.Split('=')
    [PSCustomObject]@{
        Name  = $parts[0]
        Value = $parts[1]
    }
}

# 设置环境变量
foreach ($envVar in $envVars) {
    Set-Item -Path "env:$($envVar.Name)" -Value $envVar.Value
}

# 检查并创建必要的目录结构
if (-not (Test-Path "./backend")) {
    New-Item -ItemType Directory -Path "./backend"
    Write-Host "创建了backend目录" -ForegroundColor Yellow
}

# 检查init.sql文件是否存在，如果不存在则创建一个示例
if (-not (Test-Path "./backend/init.sql")) {
    @"
-- 示例SQL初始化脚本
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
"@ | Out-File -FilePath "./backend/init.sql" -Encoding UTF8
    Write-Host "创建了示例init.sql文件" -ForegroundColor Yellow
}

# 删除旧映像，启动Docker容器
Write-Host "Try delete prior Docker containers and images..." -ForegroundColor Cyan
docker-compose down -v
docker rmi -f h5game_platform-backend
docker rmi -f h5game_platform-frontend

Write-Host "Starting Docker Container..." -ForegroundColor Cyan
docker-compose --env-file .env up -d

# 检查容器是否成功启动
$runningContainers = docker ps --format "{{.Names}}"
if ($runningContainers -like "*postgres*" -and $runningContainers -like "*minio*" -and $runningContainers -like "*backend*") {
    Write-Host "`nDeployment succeeds!" -ForegroundColor Green
    Write-Host "Admin password(Please remember this): $adminPassword"
    Write-Host "Admin hash: $env:ADMIN_HASH"
    Write-Host "RS256 key succeeds!"
    Write-Host "`nAccess address:" -ForegroundColor Cyan
    Write-Host "MinIO console: Check in .env PUBLIC_MINIO_URL"
    Write-Host "front end: Check in .env PUBLIC_FRONT_URL"
} else {
    Write-Host "`nDeployment failed, please check the following logs:" -ForegroundColor Red
    docker-compose logs
}

# Write-Host "`nSaving Docker images to tar files..." -ForegroundColor Cyan
# docker save h5game_platform-backend -o h5game_platform-backend.tar
# docker save h5game_platform-frontend -o h5game_platform-frontend.tar
# docker save postgres -o postgres.tar
# docker save minio/minio -o minio.tar
# Write-Host "Docker images saved successfully!" -ForegroundColor Green