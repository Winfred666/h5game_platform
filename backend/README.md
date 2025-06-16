本实验的后端实现。
注意，安装依赖包前请安装 Rust 编译器，否则有些依赖包无法 build。同时，若你此前没有安装 Build Tools For Visual Studio 中的 Visual C++，也请进行安装。

准备后端环境：

```bash
# create new venv or conda env for fastAPI backend
pip install -r requirements.txt
# create containers and volumes, if fail, manually pull image of MinIO and Posgres 
docker-compose up -d
```

开发环境下清空数据库数据并重新初始化所有表，重新运行、调试（建议使用）
```bash
docker-compose down -v
docker-compose up -d
uvicorn main:app --host 0.0.0.0 --port 8848 --reload
```

停止服务，保留数据库状态和数据（不建议使用，无法清除 volume）
```bash
docker-compose stop
```
docker-compose logs -f backend
docker cp .\test_minio.py h5game_platform-backend-1:/test_minio.py
docker-compose exec backend python /test_minio.py
docker exec -it postgres psql -U postgres -d game_metadata
docker-compose exec backend env | grep MINIO