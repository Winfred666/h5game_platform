# h5game_platform

简单的 h5 在线游戏内容 CMS 分享平台 ，支持服务器部署，ZJU-SE 课程作业。新版本使用 next.js ，sqlite 和 minio 以精简代码，将容器减少到两个。跟目录就是 create next app 配置的文件结构。

## 开发

安装依赖：

```bash
npm i
```

只运行 minio 容器，以供开发使用：

```bash
docker-compose -f docker-compose-dev.yml up -d

# 重新创建容器后，需要再用 npm run db:dev 往 minio 加入图像
docker-compose -f docker-compose-dev.yml down -v
```

初始化 sqlite 数据库，并用 `seed-dev.ts` 加载 mock 游戏和用户（游戏包体无法自动上传，因此所有的 size 都是 0.0 MB）：

```bash
npm run db:dev
```

另开一个终端，启动 next.js 服务器：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000/h5game](http://localhost:3000/h5game) with your browser to see the result.

初始管理员 QQ:10000000 和密码: password123，都在 `.env.development` 中。

## 部署

需要使用 docker, docker compose, openssl

### Windows (test 环境)

在 windows 环境下，注意使用 `powershell 7` 版本，即 `$PSVersionTable.PSVersion` 应该显示 7。你可以直接用该命令启动所有容器：

```powershell
.\deploy.ps1 deploy -PublicFrontUrl "https://X/XX/XXX" -PublicMinioUrl "https://X/XX/XXX/assets" -AdminName "XXX"
```

如：

```bash
.\deploy.ps1 deploy -PublicFrontUrl "http://localhost:3002/h5game" -PublicMinioURL "http://localhost:9000" -AdminName "first_admin" -FrontPort 3002 -MinioPort 9000 -MinioConsolePort 9001
```

部署脚本会自动生成 `.env.production` 配置文件以保存所有凭据。可使用 `-Force` 以强制创建新的 `.env.production` 文件，`-SkipBuild` 以复用构建好的 next.js 容器。

清理容器方式：

```powershell
.\deploy.ps1 clean
```

### Linux (prod 环境)

在 linux 环境下 （支持 docker-compose v3），可以尝试使用该命令，直接在本机构建所有容器：

```bash
chmod a+x deploy.sh
./deploy.sh deploy --public-front-url https://example.com/h5game --public-minio-url https://example.com/h5game/assets --admin-name first_admin --front-port 14399 --minio-port 14400 --minio-console-port 14401
```

这里以上面的脚本设置为例，进行最后的 nginx 配置，需要 编译时 --with-http_auth_request_module：
1. 在 `/etc/nginx/conf.d` 中创建新的代理规则。 
2. 映射 `--public-front-url` 对应的 location 到本机的 `--front-port`；
3. 映射 `--public-minio-url` 对应的 location，到本机的 `--minio-port` 。
4. shared array buffer 即 sab 类型游戏需要 nginx 添加特殊的 header
5. 刷新 cache，减缓流量压力。需要 nginx 匹配版本控制段，同时在 nginx 中设置较大缓存。

```nginx
server {
    listen 443 ssl;
    server_name example.com;
    http2 on;
    client_max_body_size 500m; # consistent with that in next.config.ts

    # Internal location for asset version validation.
    # This is called by auth_request.
    location = /h5game_internal_auth {
        internal; # Ensures this can only be called from within Nginx
        
        # Proxy to the Next.js auth API endpoint
        # The query string from the auth_request directive is automatically passed.
        proxy_pass http://localhost:14399/api/auth-asset;
        
        # Standard cleanup for auth requests
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
    }

    # 1) Versioned SAB assets: /h5game/assets/sab/<version>/...
    location ~ "^/h5game/assets/sab/(\d{13})/(.*)$" {
        # Perform validation before serving.
        # Pass the captured version ($1) and path ($2) as query params.
        auth_request /h5game_internal_auth?version=$1&path=$2;

        add_header Cache-Control "public, max-age=31536000, immutable, s-maxage=604800" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
        add_header Cross-Origin-Embedder-Policy "require-corp" always;

        proxy_set_header Host $host;
        proxy_pass http://localhost:14400/$2;
    }

    # 2) Versioned general assets: /h5game/assets/<version>/* (non-SAB)
    location ~ "^/h5game/assets/(\d{13})/(.*)$" {
        # Perform validation before serving.
        # Pass the captured version ($1) and path ($2) as query params.
        auth_request /h5game_internal_auth?version=$1&path=$2;

        add_header Cache-Control "public, max-age=31536000, immutable, s-maxage=604800" always;
        proxy_set_header Host $host;
        
        proxy_pass http://localhost:14400/$2;
    }

    # 3) static part of App
    location /h5game/_next/static/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        proxy_set_header Host $host;
        proxy_pass http://localhost:14399;
    }

    # 4) dynamic part of App
    location /h5game {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;

        proxy_set_header Host $host;
        proxy_pass http://localhost:14399;

        proxy_set_header X-Real-IP $remote_addr; # get client ip
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme; # came via https and safe to visit __Secure cookie.
    }
}
```

## 备份和恢复

H5游戏平台使用 Docker volumes 存储持久数据：

一定要注意，不要创建并覆盖之前的 `.env.production` 文件！！ 必须使用相同的环境变量，才能恢复数据。

- **Database**: SQLite database 存于 `/data/db/prod.db`
- **File Storage**: MinIO object 存于 `/data/minio/`
- **Shared Volume**: 两种服务都使用 `shared_data` volume

### 备份 volume

```bash
BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
mkdir -p ./backups/$BACKUP_TIME

# Backup the entire shared volume
sudo docker run --rm \
  -v h5game_platform_shared_data:/source:ro \
  -v $(pwd)/backups/$BACKUP_TIME:/backup \
  alpine tar czf /backup/h5game_backup.tar.gz -C /source .
```

### 恢复 volume

```bash
# Stop services
docker compose --env-file .env.production down

# Remove existing volume
docker volume rm h5game_platform_shared_data

# Create new volume
docker volume create h5game_platform_shared_data

# Restore from backup
BACKUP_FILE="./backups/$BACKUP_TIME/h5game_backup.tar.gz"
docker run --rm \
  -v h5game_platform_shared_data:/target \
  -v $(pwd)/$(dirname $BACKUP_FILE):/backup \
  alpine tar xzf /backup/$(basename $BACKUP_FILE) -C /target

# Start services
docker compose --env-file .env.production up -d

echo "✅ Restore completed!"
```

### APP内可读形式导出

此备份将所有数据下载到本地。打开 `${NEXT_PUBLIC_FRONT_URL}/h5game/admin-dashboard/games`，最上方有导出数据库按钮，可一次性将所有数据本地化。

下载的 `h5game_backup.zip` 包含完整的系统数据，可以使用 Python 脚本重组数据结构。

将 [reorganize_backup.py](/reorganize_backup.py) 脚本复制到 `h5game_backup.zip` 所在文件夹。

```bash
python reorganize_backup.py
```

重组后的目录结构类似于：

reorganized_games/
├── 游戏标题1/              # 以游戏标题命名，包含所有游戏资源
│   ├── introduction.md    # 每个游戏的详细介绍（Markdown 格式）
│   ├── index.html         # 在线游戏主文件等
│   ├── assets             # 游戏封面和截图
│   └── game.zip           # 游戏压缩包
├── 游戏标题2/
