from minio import Minio
from minio.error import S3Error
import zipfile
import io
import os
import json
import time
from minio.deleteobjects import DeleteObject
minio_port = os.getenv("MINIO_PORT", "9000")
# old MINIO_ENDPOINT
minio_endpoint = os.getenv("PUBLIC_MINIO_URL", f"http://localhost:{minio_port}")
minio_prefix = f"{minio_endpoint}/"


class MinIOClient:
    def __init__(self):
        # 直接使用容器内网，固定端口
        endpoint = "localhost:9000" if os.getenv("PUBLIC_MINIO_URL") is None else "minio:9000"
        self.client = Minio(
            endpoint = str(endpoint), # 默认使用容器名
            access_key = os.getenv("MINIO_ROOT_USER", "minioadmin"),
            secret_key = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin"),
            secure = False,  # 如果使用HTTPS，请设置为True
        )
        self.prefix = minio_prefix
        self.create_bucket("games")
        self.create_bucket("images")
        self.create_bucket("photo")

    def create_bucket(
        self, bucket_name, username="minioadmin", admin_user="minioadmin"
    ):
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)

            bucket_arn = f"arn:aws:s3:::{bucket_name}"
            object_arn = f"{bucket_arn}/*"

            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    # 公开读取权限
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [object_arn],
                    },
                    # 操作员权限（包含删除）
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "AWS": [f"arn:aws:iam::123456789012:user/{username}"]
                        },
                        "Action": [
                            "s3:PutObject",
                            "s3:DeleteObject",  # 确保包含删除权限
                            "s3:ListBucket",
                            "s3:GetBucketLocation",
                        ],
                        "Resource": [bucket_arn, object_arn],
                    },
                    # 管理员权限
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "AWS": [f"arn:aws:iam::123456789012:user/{admin_user}"]
                        },
                        "Action": ["s3:*"],
                        "Resource": [bucket_arn, object_arn],
                    },
                ],
            }

            max_retries = 3
            for attempt in range(max_retries):
                try:
                    self.client.set_bucket_policy(bucket_name, json.dumps(policy))
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(1)
            return True

        except Exception as e:
            print(f"操作失败: {str(e)}")
            return False

    async def upload_game_package(self, game_id, zip_data):
        """上传游戏ZIP包并解压"""
        try:
            zip_name = f"{game_id}/original.zip"
            zip_data.seek(0)
            self.client.put_object(
                "games", zip_name, zip_data, length=zip_data.getbuffer().nbytes
            )
            zip_data.seek(0)
            with zipfile.ZipFile(zip_data, "r") as zip_ref:
                self._upload_zip_contents(game_id, zip_ref)
            # 返回游戏入口URL
            index_html_path = self.find_index_html_path(prefix=f"{game_id}/")
            return index_html_path

        except Exception as e:
            print(f"Upload failed: {e}")
            raise

    EXTENSION_TO_MIME = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
        "svg": "image/svg+xml",
        "pdf": "application/pdf",
        "txt": "text/plain",
        "html": "text/html",
        "htm": "text/html",
        "js": "application/javascript",
        "css": "text/css",
        "json": "application/json",
        "xml": "application/xml",
        "zip": "application/zip",
        "gz": "application/gzip",
        "tar": "application/x-tar",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "mp4": "video/mp4",
        "avi": "video/x-msvideo",
        "mov": "video/quicktime",
        "woff": "font/woff",
        "woff2": "font/woff2",
        "ttf": "font/ttf",
        "otf": "font/otf",
        "csv": "text/csv",
        "md": "text/markdown",
        "yaml": "application/x-yaml",
        "yml": "application/x-yaml",
        "exe": "application/x-msdownload",
        "dll": "application/x-msdownload",
        "jar": "application/java-archive",
        "class": "application/java-vm",
        "ico": "image/x-icon",
        "bmp": "image/bmp",
        "tiff": "image/tiff",
        "tif": "image/tiff",
        "jsonl": "application/jsonlines",
        "log": "text/plain",
        "rtf": "application/rtf",
        "ppt": "application/vnd.ms-powerpoint",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "apk": "application/vnd.android.package-archive",
        "ipynb": "application/x-ipynb+json",
        "py": "text/x-python",
        "sh": "application/x-sh",
        "sql": "application/sql",
        "swf": "application/x-shockwave-flash",
        "torrent": "application/x-bittorrent",
        "xhtml": "application/xhtml+xml",
        "xpi": "application/x-xpinstall",
        "wasm": "application/wasm",
        "mjs": "application/javascript",
    }

    # 多级扩展名映射（处理特殊情况）
    MULTI_EXTENSION_TO_MIME = {
        "tar.gz": "application/gzip",
        "tar.bz2": "application/x-bzip2",
        "tar.xz": "application/x-xz",
        "zip.xz": "application/zip",
        "7z": "application/x-7z-compressed",
    }

    def get_mime_type(self, filename, check_content=False):
        """
        获取文件的 MIME 类型

        参数:
            filename (str): 文件名或文件路径
            check_content (bool): 是否检查文件内容（较慢，但更准确）

        返回:
            str: MIME 类型字符串，如果无法确定则返回 'application/octet-stream'
        """
        try:
            # 提取纯文件名（去除路径信息）
            base_name = os.path.basename(filename)

            # 处理隐藏文件（以点开头且无扩展名）
            if base_name.startswith(".") and len(base_name.split(".")) == 1:
                return "application/octet-stream"

            # 尝试识别多级扩展名
            for multi_ext in self.MULTI_EXTENSION_TO_MIME:
                if base_name.endswith(f".{multi_ext}"):
                    return self.MULTI_EXTENSION_TO_MIME[multi_ext]

            # 处理常规扩展名
            ext = os.path.splitext(filename)[1].lower()
            if ext:
                ext = ext[1:]  # 移除点号
                mime_type = self.EXTENSION_TO_MIME.get(ext)
                if mime_type:
                    return mime_type

            return "application/octet-stream"

        except Exception as e:
            # 记录错误但不中断程序
            print(f"Error getting MIME type for {filename}: {e}")
            return "application/octet-stream"

    def _upload_zip_contents(self, game_id, zip_ref):
        """上传ZIP包内容到MinIO"""
        for file in zip_ref.namelist():
            if not file.endswith("/"):
                file_data = zip_ref.read(file)
                content_type = self.get_mime_type(file)
                self.client.put_object(
                    "games",
                    f"{game_id}/{file}",
                    io.BytesIO(file_data),
                    len(file_data),
                    content_type=content_type,
                )

    async def upload_image(self, game_id, position, image_path, image_type):
        """上传图片，游戏id,pos分辨封面截图，图片路径，图片类型"""
        try:
            image_name = f"{game_id}/{position}.{image_type}"
            self.client.put_object(
                "images", image_name, image_path, length=image_path.getbuffer().nbytes
            )
            return
        except Exception as e:
            print(f"Upload failed: {e}")
            raise

    async def upload_photo(self, id, image_path, image_type):
        """上传图片，用户id,图片路径(BytesIO()流)，图片类型(png,jpg)"""
        try:
            image_name = f"{id}.{image_type}"
            self.client.put_object(
                "photo", image_name, image_path, length=image_path.getbuffer().nbytes
            )
            return
        except Exception as e:
            print(f"Upload failed: {e}")
            raise

    def delete_photo(self, id, image_type):
        """删除头像，id,图片类型"""
        try:
            image_name = f"{id}.{image_type}"
            self.client.remove_object("photo", image_name)
            return True
        except Exception as e:
            print(f"Delete failed: {e}")
            return False

    def delete_image(self, game_id, position, image_type):
        """删除图片，游戏id,pos分辨封面截图，图片类型"""
        try:
            image_name = f"{game_id}/{position}.{image_type}"
            self.client.remove_object("images", image_name)
            return True
        except Exception as e:
            print(f"Delete failed: {e}")
            return False

    def delete_folder(self, bucket_name, folder_path):
        # 删一个文件夹folder_path : 要删除的文件夹路径（必须以/结尾）
        try:
            objects = self.client.list_objects(
                bucket_name, prefix=folder_path, recursive=True
            )
            delete_list = [DeleteObject(obj.object_name) for obj in objects]
            delete_list.append(DeleteObject(folder_path))
            if not delete_list:
                return True
            errors = []
            for error in self.client.remove_objects(bucket_name, delete_list):
                errors.append(error)
                print(f"删除错误: {error}")
            time.sleep(1)
            remaining = list(self.client.list_objects(bucket_name, prefix=folder_path))
            if remaining:
                print(f"警告: 仍有 {len(remaining)} 个对象未被删除")
        except S3Error as e:
            print(f"失败: {e}")

    def find_index_html_path(
        self, bucket_name="games", target_file="index.html", prefix=""
    ):
        try:
            objects = self.client.list_objects(
                bucket_name, prefix=prefix, recursive=True
            )
            for obj in objects:
                if obj.object_name.endswith(target_file):
                    return f"{minio_prefix}games/{obj.object_name}"
            return None

        except S3Error as exc:
            print(f"MinIOfind error: {exc}")
            return None
