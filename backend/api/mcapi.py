from minio import Minio
from io import BytesIO


class MinioClient:
    def __init__(self):
        self.mc = Minio(
            "127.0.0.1:9000",
            access_key="minioadmin",
            secret_key="minioadmin",
            secure=False,
        )

    def __del__(self):
        del self.mc

    def __exist_bucket(self, bucket_name: str) -> bool:
        try:
            return self.mc.bucket_exists(bucket_name)
        except Exception:
            return False

    def __create_bucket(self, bucket_name: str) -> bool:
        if self.__exist_bucket(bucket_name):
            return True
        try:
            self.mc.make_bucket(bucket_name)
            return True
        except Exception:
            return False

    def __remove_bucket(self, bucket_name: str) -> bool:
        if not self.__exist_bucket(bucket_name):
            return True
        try:
            self.mc.remove_bucket(bucket_name)
            return True
        except Exception:
            return False

    def upload_file(
        self, bucket_name: str, file_name: str, file_stream: BytesIO
    ) -> bool:
        self.__create_bucket(bucket_name)
        try:
            if self.mc.stat_object(bucket_name, file_name):
                self.mc.remove_object(bucket_name, file_name)
            self.mc.put_object(
                bucket_name=bucket_name,
                object_name=file_name,
                data=file_stream,
                length=file_stream.getbuffer().nbytes,
            )
            return True
        except Exception:
            return False

    def download_file(self, bucket_name: str, file_name: str) -> BytesIO | None:
        if not self.__exist_bucket(bucket_name):
            return None
        try:
            response = self.mc.get_object(bucket_name, file_name)
            return BytesIO(response.data)
        except Exception:
            return None

    def remove_file(self, bucket_name: str, file_name: str) -> bool:
        if not self.__exist_bucket(bucket_name):
            return True
        try:
            self.mc.remove_object(bucket_name, file_name)
            return True
        except Exception:
            return False

    def replace_file(
        self, bucket_name: str, file_name: str, file_stream: BytesIO
    ) -> bool:
        if not self.__exist_bucket(bucket_name):
            return False
        try:
            self.mc.remove_object(bucket_name, file_name)
            self.mc.put_object(
                bucket_name=bucket_name,
                object_name=file_name,
                data=file_stream,
                length=file_stream.getbuffer().nbytes,
            )
            return True
        except Exception:
            return False
