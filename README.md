# h5game_platform

![Alt text](assets/image.png)

![Alt text](assets/image-1.png)

简单的 h5 在线游戏内容 CMS 分享平台 ，支持服务器部署，ZJU-SE 课程作业。新版本使用 next.js ，sqlite 和 minio 以精简代码，将容器减少到两个。跟目录就是 create next app 配置的文件结构。

### Getting Started

安装依赖：
```bash
npm i
```

如果出现加载错误请删除 “.next” 文件夹重新构建。

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 部署

需要使用 docker, docker compose, openssl

### Windows

在 windows 环境下，注意使用 `powershell 7` 版本，即 `$PSVersionTable.PSVersion` 应该显示 7。你可以直接用该命令启动所有容器：

```powershell
.\deploy.ps1 deploy -PublicFrontUrl "https://X/XX/XXX" -PublicMinioUrl "https://X/XX/XXX/assets" -AdminName "the_very_first_admin"
```

部署脚本会自动生成 `.env.production` 配置文件以保存所有凭据。可使用 `-Force` 以强制创建新的 `.env.production` 文件，`-SkipBuild` 以取消重新构建前端容器。

清理容器方式：

```powershell
.\deploy.ps1 clean
```

### Linux

在 linux 环境下 （支持 docker-compose v3），可以尝试使用该命令，直接在本机构建所有容器：

```bash
./deploy.sh true
```

若 linux 服务器不支持 image building ，先在本机运行上述命令后，拷贝根目录下的 `*.tar`，`.env`，`docker-compose.yml` 和 `deploy.sh` 到服务器上，运行部署命令：

```bash
chmod a+x deploy.sh
./deploy.sh
```

最后在 `nginx.conf` 中，映射 `PUBLIC_FRONT_URL` 到本机的 `FRONT_PORT`； `PUBLIC_BACK_URL` 到本机的 `BACK_PORT`； `PUBLIC_MINIO_URL` 到本机的 `MINIO_PORT` ，由于前端已经设置了 basePath，因此不需要截去 `/h5game` 前缀。 

```nginx
location ^~ /h5game/assets/ {
                proxy_pass http://localhost:14399/;
                proxy_set_header Host $host;
}
location ^~ /h5game {
                proxy_pass http://localhost:14400;
                proxy_set_header Host $host;
}
```