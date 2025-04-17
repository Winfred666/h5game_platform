from minio import Minio
from minio.error import S3Error
import zipfile
import io
import os
import json

'''
User->>Backend: 上传ZIP(game.zip)
    Backend->>MinIO: upload_game_package("games", "123", "/tmp/game.zip")
    MinIO-->>Backend: 返回游戏URL
    Backend-->>User: 显示成功及游戏链接

    User->>Backend: 请求下载游戏
    Backend->>MinIO: download_game_zip("games", "123", "/tmp/downloaded.zip")
    MinIO-->>Backend: 返回ZIP文件
    Backend-->>User: 发送下载文件
我认为的minio文件逻辑,可调整
games/                      # Bucket名称
   └── 6ba7b810-9dad-11d1/  # game_id
       ├── original.zip     # 原始ZIP备份
       ├── index.html       # 游戏入口文件
       └── 解压后文件        
       ├── cover.jpg        # 封面
       └── screenshots/     # 截图
        ├── 0.png
        └── 1.png
'''

class MinIOClient:
    def __init__(self):
        self.client = Minio(
            "localhost:9000",
            access_key="minioadmin",
            secret_key="minioadmin",
            secure=False
        )
    
    def create_bucket(self, bucket_name):
        """创建存储桶并设置公开读取策略"""
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)
                
                # 转为JSON字符串
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                        }
                    ]
                }
                
                
                self.client.set_bucket_policy(
                    bucket_name,
                    json.dumps(policy)  
                )
            return True
        except Exception as e:
            print(f"创建存储桶失败: {e}")
            return False
    
    def upload_game_package(self, bucket_name, game_id, zip_path):
        """上传游戏ZIP包并解压"""
        try:
            # 1. 上传原始ZIP包
            zip_name = f"{game_id}/original.zip"
            self.client.fput_object(bucket_name, zip_name, zip_path)
            
            # 2. 解压并上传所有文件
            #保持原始目录结构上传（如ZIP内有 a/b.png，则上传为 game_id/a/b.png）
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                for file in zip_ref.namelist():
                    if not file.endswith('/'):  # 忽略目录
                        file_data = zip_ref.read(file)
                        self.client.put_object(
                            bucket_name,
                            f"{game_id}/{file}",
                            io.BytesIO(file_data),
                            len(file_data)
                        )
            
            # 3. 返回游戏入口URL
            # 假设游戏包根目录包含 index.html
            # 返回可直接访问的URL（依赖MinIO静态网站托管功能）(不确定)
            return f"http://localhost:9000/{bucket_name}/{game_id}/index.html"
        except Exception as e:
            print(f"Upload failed: {e}")
            raise
    
    def download_game_zip(self, bucket_name, game_id, output_path):
        """下载游戏ZIP包"""
        try:
            self.client.fget_object(
                bucket_name,
                f"{game_id}/original.zip",
                output_path
            )
            return True
        except S3Error as err:
            print(f"Download failed: {err}")
            return False
        
