import psycopg2
from psycopg2.extras import Json


class GameDB:
    def __init__(self, minio_prefix="http://localhost:9000/g"):
        self.conn = psycopg2.connect(
            host="localhost",
            database="game_metadata",
            user="postgres",
            password="postgres",
        )
        self.minio_prefix = minio_prefix

    """
    game_data 是一个 Python 字典,应为
    game_data = {
    # 必填字段
    "title": "游戏名称",
    
    # 可选字段（有默认值）
    "file_size": 102400,  # 字节数
    "tagline": "简短描述",  # 默认为None
    "kind": "html",  # 游戏类型，默认为None
    "embed_op": "embed_in_page",  # 默认为'embed_in_page'
    "width": 800,  # 默认为None
    "height": 600,  # 默认为None
    "description": "完整描述",  # 默认为None
    "genre": ["冒险"],  # 默认为[]
    "author_ids": "uuid-string",  # 默认为None
    "is_private": False  # 默认为False
    }
    """
    """创建游戏元数据（返回自增整数ID）"""

    def create_game(self, game_data):
        sql = """
        INSERT INTO games (
            title, tagline, kind, embed_op, width, height,
            description, genre, file_size,
            author_ids, is_private
        ) VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s
        )
        RETURNING id
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        game_data["title"],
                        game_data.get("tagline"),
                        game_data.get("kind", "html"),
                        game_data.get("embed_op", "embed_in_page"),
                        game_data.get("width"),
                        game_data.get("height"),
                        game_data.get("description"),
                        "," + ",".join(game_data.get("genre")) + ",",
                        game_data.get("file_size", 0),
                        game_data.get("author_ids"),
                        game_data.get("is_private", False),
                    ),
                )
                game_id = cur.fetchone()[0]
                self.conn.commit()
                return game_id
        except Exception as e:
            self.conn.rollback()
            raise

    def create_user(self, name, password):
        sql = """
        INSERT INTO users (name,password) 
        VALUES (%s, %s)
        RETURNING id
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (name, password))
                user_id = cur.fetchone()[0]
                self.conn.commit()
                return user_id
        except Exception as e:
            self.conn.rollback()
            raise

    def add_author(self, game_id, author_id):
        sql = """
        UPDATE games SET author_ids = array_append(author_ids, %s) WHERE id = %s; 
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (author_id, game_id))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_game(self, game_id):
        """获取游戏详情"""
        sql = "SELECT * FROM games WHERE id = %s"
        with self.conn.cursor() as cur:
            cur.execute(sql, (game_id,))
            # 返回一个元组，包含games表中对应game_id记录的所有字段值
            # 字段顺序与表结构定义顺序一致
            result = list(cur.fetchone())
            result[8] = result[8].strip(",").split(",")
            return result

    def update_game_stats(self, game_id, field, value):
        """更新游戏信息"""
        # 每次调用会使指定字段的值加1
        sql = f"UPDATE games SET {field} = {value} WHERE id = %s"
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (game_id,))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def inc_game_count(self, game_id, field):
        """更新游戏统计信息(浏览/下载)"""
        # 每次调用会使指定字段的值加1
        sql = f"UPDATE games SET {field} = {field} + 1 WHERE id = %s"
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (game_id,))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def add_game_image(self, game_id, image_type, minio_path, position=None):
        sql = """
        INSERT INTO game_images (game_id, image_type, minio_path, position)
        VALUES (%s, %s, %s, %s)
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (game_id, image_type, minio_path, position))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_game_images(self, game_id):
        sql = """
        SELECT id, game_id, image_type, minio_path, position 
        FROM game_images 
        WHERE game_id = %s
        ORDER BY image_type, position NULLS LAST
        """
        with self.conn.cursor() as cur:
            cur.execute(sql, (game_id,))
            for row in cur.fetchall():
                print(row)
            return [
                {
                    "id": row[0],
                    "type": row[2],
                    "url": self.minio_prefix + f"{row[1]}/{row[2]}",  #
                    "position": row[4],
                }
                for row in cur.fetchall()
            ]  # list - dict

    def get_image(self, image_url: str):
        sql = """
        SELECT id, game_id, image_type, minio_path, position 
        FROM game_images 
        WHERE minio_path = %s
        """
        with self.conn.cursor() as cur:
            cur.execute(sql, (image_url,))
            return [
                {
                    "id": row[0],
                    "type": row[2],
                    "url": self.minio_prefix + f"{row[1]}/{row[3]}",
                    "position": row[4],
                }
                for row in cur.fetchall()
            ]

    def delete_image(self, image_url: str):
        sql = "DELETE FROM game_images WHERE minio_path = %s"
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (image_url,))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def list_games(self):
        sql = """
        SELECT * 
        FROM games g
        WHERE NOT g.is_private
        ORDER BY g.created_at DESC
        """
        with self.conn.cursor() as cur:
            cur.execute(sql)
            result = list(cur.fetchall())
            for game in result:
                game = list(game)
                game[8] = game[8].strip(",").split(",")
            return result  # list - tuple,一个元组代表一行数据

    def get_games_by_genre(self, genre):
        sql = """
        SELECT *
        FROM games g
        WHERE g.genre LIKE %s AND NOT g.is_private
        ORDER BY g.created_at DESC
        """
        formatted_genre = f"%,{genre},%"
        with self.conn.cursor() as cur:
            cur.execute(sql, (formatted_genre,))
            result = list(cur.fetchall())
            for game in result:
                game = list(game)
                game[8] = game[8].strip(",").split(",")
            return result  # list
        #  最新创建的游戏记录会排在前面

    def list_tags(self):
        sql = "SELECT DISTINCT genre FROM games WHERE genre IS NOT NULL"
        with self.conn.cursor() as cur:
            cur.execute(sql)
            all_tags_strings = cur.fetchall()
            unique_tags = set()
            for tags_string in all_tags_strings:
                tags = tags_string[0].strip(",").split(",")
                for tag in tags:
                    unique_tags.add(tag)
            return list(unique_tags)


class Game:
    def __init__(
        self,
        game_info_list: list,
        minio_prefix="http://localhost:9000/g",
        db: GameDB = None,
    ):
        self.info = dict()
        self.info["id"] = game_info_list[0]
        self.info["title"] = game_info_list[1]
        self.info["description"] = game_info_list[7]
        self.info["release_date"] = game_info_list[11]
        self.info["developer"] = game_info_list[14]
        self.info["tags"] = game_info_list[8]
        self.info["download_url"] = minio_prefix + f"{self.info['id']}/game.zip"
        if game_info_list[3] == "html":
            self.info["online"] = {
                "width": game_info_list[5],
                "height": game_info_list[6],
                "url": minio_prefix + f"{self.info['id']}/index.html",
            }
        else:
            self.info["online"] = None
        result = db.get_game_images(self.info["id"])
        if len(result) > 1:
            self.info["screenshots"] = []
        for image in result:
            if image["type"] == "cover":
                self.info["cover_image"] = image["url"]
            elif image["type"] == "screenshot":
                self.info["screenshots"].append(image["url"])

    def get_info(self):
        return self.info
