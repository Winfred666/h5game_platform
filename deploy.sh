#!/usr/bin/env bash

# WARNING: This args is intended for deployment on a server without image building condition
BUILD_IMAGE=${1:-false}

# 修复区域设置错误：如果 en_US.UTF-8 不可用，则使用默认 C.UTF-8
if locale -a | grep -q "en_US.utf8"; then
    export LC_ALL=en_US.UTF-8
    export LANG=en_US.UTF-8
elif locale -a | grep -q "C.utf8"; then
    export LC_ALL=C.UTF-8
    export LANG=C.UTF-8
else
    # 如果都不存在，不设置区域但警告
    echo "警告：系统中缺少 en_US.UTF-8 和 C.UTF-8 区域设置，继续操作..." >&2
fi

env_file=".env"

if [ "$BUILD_IMAGE" = true ]; then
    # 检查OpenSSL是否可用，否则退出
    if ! command -v openssl &>/dev/null; then
        echo "Error: OpenSSL not found, which is required." >&2
        exit 1
    fi

    # 定义生成 SHA256 哈希的函数
    generate_sha256_hash() {
        echo -n "$1" | openssl dgst -sha256 -hex | cut -d' ' -f2
    }

    # 定义生成 RSA 密钥对并获取 Base64 编码的函数
    generate_rsa_keys() {
        # 创建临时目录
        temp_dir=$(mktemp -d)
        
        # 生成私钥
        private_key="$temp_dir/private.pem"
        openssl genrsa -out "$private_key" 2048
        
        # 生成公钥
        public_key="$temp_dir/public.pem"
        openssl rsa -in "$private_key" -pubout -out "$public_key"
        
        # 读取并Base64编码
        private_base64=$(base64 -w 0 < "$private_key")
        public_base64=$(base64 -w 0 < "$public_key")
        
        # 清理临时文件
        rm -rf "$temp_dir"
        
        echo "$private_base64 $public_base64"
    }

    # 生成必要的随机字符串
    minio_password=$(openssl rand -hex 16)
    postgres_password=$(openssl rand -hex 20)
    admin_password=$(openssl rand -hex 16)
    admin_hash=$(generate_sha256_hash "$admin_password")

    # 生成RSA密钥对
    keys=$(generate_rsa_keys)
    private_base64=$(echo "$keys" | cut -d' ' -f1)
    public_base64=$(echo "$keys" | cut -d' ' -f2)

    # 确保 .env 文件存在且包含正确内容
    cat > "$env_file" << EOF
BACK_PORT=14399
MINIO_PORT=14400
POSTGRES_PORT=14401
FRONT_PORT=14402
PUBLIC_FRONT_URL=https://www.qsc.zju.edu.cn/h5game
PUBLIC_MINIO_URL=https://www.qsc.zju.edu.cn/h5game/assets
PUBLIC_BACK_URL=https://www.qsc.zju.edu.cn/h5game/api
# PUBLIC_FRONT_URL=http://localhost:14402
# PUBLIC_MINIO_URL=http://localhost:14400
# PUBLIC_BACK_URL=http://localhost:14399
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=$minio_password
# 生产环境下需要备份卷，因此固定不可见的 posgre 用户名
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=game_metadata
# 不直接存储密码
# ADMIN_PASSWORD=$admin_password
ADMIN_HASH=$admin_hash
RS256_PRIVATE_KEY=$private_base64
RS256_PUBLIC_KEY=$public_base64
EOF
fi

# 确保环境变量文件被忽略

# 加载环境变量
set -a
source "$env_file"
set +a

# 清理旧的Docker容器和镜像
echo "Cleaning up prior Docker artifacts..." >&2

if [ "$BUILD_IMAGE" = true ]; then
    docker-compose down -v
    echo "Building Docker images..." >&2
    docker rmi -f h5game_platform-backend:v1.0 2>/dev/null
    docker rmi -f h5game_platform-frontend:v1.0 2>/dev/null
    docker rmi -f h5game_platform-main-backend:v1.0 2>/dev/null
    docker rmi -f h5game_platform-main-frontend:v1.0 2>/dev/null
    # 启动Docker容器
    echo "Starting Docker Container..." >&2
    # 创建默认环境文件（Compose V1 不支持 --env-file）
    docker-compose up -d --build --force-recreate --remove-orphans
else
    docker-compose down -v
    docker rmi -f h5game_platform-backend:v1.0 2>/dev/null
    docker rmi -f h5game_platform-frontend:v1.0 2>/dev/null
    docker rmi -f postgres:16-alpine 2>/dev/null
    docker rmi -f minio/minio:latest 2>/dev/null

    echo "Skipping Docker image build, using existing images..." >&2
    docker load < h5game_platform-backend.tar
    docker load < h5game_platform-frontend.tar
    docker load < postgres.tar
    docker load < minio.tar
    # docker rmi -f h5game_platform-backend:latest 2>/dev/null
    # docker rmi -f h5game_platform-frontend:latest 2>/dev/null
    docker-compose up -d --no-build --force-recreate --remove-orphans
fi


# 检查容器是否成功启动
sleep 5 # 给容器启动一点时间
running_containers=$(docker ps --format "{{.Names}}")

if [[ "$running_containers" == *postgres* && "$running_containers" == *minio* && "$running_containers" == *backend* ]]; then
    echo -e "\nDeployment succeeds!" >&2
    echo "Admin password (please remember this): $admin_password" >&2
    echo "Admin hash: $ADMIN_HASH" >&2
    echo -e "\nAccess addresses:" >&2
    echo "MinIO console: $PUBLIC_MINIO_URL/minio/login" >&2
    echo "Frontend: $PUBLIC_FRONT_URL" >&2
    echo "Backend API: $PUBLIC_BACK_URL" >&2
    echo "PostgreSQL: localhost:$POSTGRES_PORT" >&2
else
    echo -e "\nDeployment failed, please check the logs:" >&2
    docker-compose logs
fi

if [ "$BUILD_IMAGE" = true ]; then
    echo "Saving Docker images..." >&2
    docker save h5game_platform-backend -o h5game_platform-backend.tar
    docker save h5game_platform-frontend -o h5game_platform-frontend.tar
    docker save postgres -o postgres.tar
    docker save minio/minio -o minio.tar
    echo "Docker images saved successfully. Now to deploy, move project code+tar files to server !!" >&2
    echo "Then run 'chmod a+x deploy.sh; ./deploy.sh' script on the server to start the deployment." >&2
fi