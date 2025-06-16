import psycopg2
from psycopg2 import OperationalError

from api.minio import *
from datetime import datetime, timezone, timedelta

client = MinIOClient()


class GameDB:
    def __init__(self):
        retries = 3
        delay = 5
        for i in range(retries):
            try:
                self.conn = psycopg2.connect(
                    host="localhost" if os.getenv("PUBLIC_MINIO_URL") is None else "postgres",
                    database = os.getenv("POSTGRES_DB", "game_metadata"),
                    user = os.getenv("POSTGRES_USER", "postgres"),
                    password = os.getenv("POSTGRES_PASSWORD", "postgres") ,
                )
                break
            except OperationalError as e:
                print(f"Connection attempt {i + 1} failed: {e}")
                if i < retries - 1:
                    print(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                else:
                    raise Exception("Failed to connect to the database after multiple attempts.")
        
        self.minio_prefix = client.prefix
        sql = """
        INSERT INTO users (qq, name, pwd_hash, is_admin)  
        VALUES (%s, %s, %s, %s)
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE qq = '1'")
                password = os.getenv("ADMIN_HASH", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                if not cur.fetchone():
                    cur.execute(
                        sql,
                        (
                            "1",
                            "admin",
                            str(password),
                            True,
                        ),
                    )
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def create_game(self, game_data):
        sql = """
        INSERT INTO games (title, kind, embed_op, width, height,description, genre, author_ids, size) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        game_data["title"],
                        game_data.get("kind", "html"),
                        game_data.get("embed_op", "embed_in_page"),
                        game_data.get("width"),
                        game_data.get("height"),
                        game_data.get("description"),
                        game_data.get("genre"),
                        game_data.get("author_ids"),
                        game_data.get("size"),
                    ),
                )
                game_id = cur.fetchone()[0]
                self.conn.commit()
                return game_id
        except Exception as e:
            self.conn.rollback()
            raise

    def delete_game(self, game_id):
        sql1 = """ 
        DELETE FROM game_images WHERE game_id = %s
        """
        sql2 = """
        DELETE FROM games WHERE id = %s
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql1, (game_id,))
                cur.execute(sql2, (game_id,))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_game_info(self, game_id, is_private=False):
        """获取数据库中游戏所有字段,list"""
        sql = """
            SELECT * \
            FROM games g
            WHERE g.id = %s
            AND g.is_private = %s"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        game_id,
                        is_private,
                    ),
                )
                # 返回一个元组，包含games表中对应game_id记录的所有字段值
                # 字段顺序与表结构定义顺序一致
                result = cur.fetchone()
                if result is None:
                    return None
                else:
                    return list(result)
        except Exception as e:
            self.conn.rollback()
            raise

    def search_games(self, name):
        """按名称搜索，返回游戏id,list"""
        sql = """
        SELECT id 
        FROM games g
        WHERE g.title LIKE %s AND NOT g.is_private
        ORDER BY g.created_at DESC
        LIMIT 10
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (f"%{name}%",))
                result1 = cur.fetchall()
                result = []
                for game in result1:
                    result.append(game[0])
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def get_game_by_name(self, name):
        """按名称搜索，返回前端要求游戏信息"""
        id = self.search_games(name)
        result = []
        for game_id in id:
            result.append(self.get_game(game_id))
        return result

    def update_game_stats(self, game_id, field, value):
        """更新游戏信息"""
        sql = f"UPDATE games SET {field} = %s WHERE id = %s"
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        value,
                        game_id,
                    ),
                )
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

    def add_game_image(self, game_id, cover_type, screenshot_type):
        sql = """
        INSERT INTO game_images (game_id, cover_type, screenshot_type)
        VALUES (%s, %s, %s)
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        game_id,
                        cover_type,
                        screenshot_type,
                    ),
                )
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def delete_image(self, game_id: int, pos: int):
        sql = "UPDATE game_images SET screenshot_type = %s WHERE game_id = %s "
        try:
            with self.conn.cursor() as cur:
                type = self.get_image_type(game_id)
                result = type[pos - 1]
                del type[pos - 1]
                new_type = str()
                if len(type) == 2:
                    new_type = type[1]
                if len(type) == 3:
                    new_type = type[1] + "," + type[2]
                cur.execute(
                    sql,
                    (
                        new_type,
                        game_id,
                    ),
                )
                self.conn.commit()
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def update_sc_type(self, game_id: int, pos: int, new_type: str):
        sql = "UPDATE game_images SET screenshot_type = %s WHERE game_id = %s "
        try:
            with self.conn.cursor() as cur:
                type = self.get_image_type(game_id)
                if len(type) < pos:
                    new_types = str()
                    if len(type) == 1:
                        new_types = new_type
                    if len(type) == 2:
                        new_types = type[1] + "," + new_type
                    if len(type) == 3:
                        new_types = type[1] + "," + type[2] + "," + new_type
                    cur.execute(
                        sql,
                        (
                            new_types,
                            game_id,
                        ),
                    )
                    self.conn.commit()
                    return
                type[pos - 1] = new_type
                new_types = str()
                if len(type) == 2:
                    new_types = type[1]
                if len(type) == 3:
                    new_types = type[1] + "," + type[2]
                if len(type) == 4:
                    new_types = type[1] + "," + type[2] + "," + type[3]
                cur.execute(
                    sql,
                    (
                        new_types,
                        game_id,
                    ),
                )
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def add_sc1(self, game_id: int, new_type: str):
        sql = "UPDATE game_images SET screenshot_type = %s WHERE game_id = %s "
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        new_type,
                        game_id,
                    ),
                )
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def update_cov_type(self, game_id: int, new_type: str):
        sql = "UPDATE game_images SET cover_type = %s WHERE game_id = %s "
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        new_type,
                        game_id,
                    ),
                )
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def list_game_id(self):
        # 列出所有游戏的ID，list
        sql = """
        SELECT id 
        FROM games g
        WHERE NOT g.is_private
        ORDER BY g.created_at DESC
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql)
                games = cur.fetchall()
                result = []
                for game in games:
                    result.append(game[0])
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def list_games(self):
        """列出所有游戏，返回前端要求游戏信息"""
        id = self.list_game_id()
        result = []
        for game_id in id:
            result.append(self.get_game(game_id))
        return result

    def get_id_genre(self, genre):
        """标签查找游戏id，list"""
        sql = """
        SELECT id FROM games g
        WHERE g.genre LIKE %s 
        AND NOT g.is_private
        LIMIT 10
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (f"%{genre}%",))
                id = cur.fetchall()
                result = []
                for game in id:
                    result.append(game[0])
                return result  # list
        #  最新创建的游戏记录会排在前面
        except Exception as e:
            self.conn.rollback()
            raise

    def get_games_by_tag(self, tag):
        """标签查找，返回前端要求游戏信息"""
        id = self.get_id_genre(tag)
        result = []
        for game_id in id:
            result.append(self.get_game(game_id))
        return result

    def list_tags(self):
        sql = "SELECT DISTINCT genre FROM games WHERE genre IS NOT NULL"
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql)
                all_tags_strings = cur.fetchall()
                unique_tags = set()
                for tags_string in all_tags_strings:
                    tags = tags_string[0].split(",")
                    for tag in tags:
                        unique_tags.add(tag)
                return list(unique_tags)
        except Exception as e:
            self.conn.rollback()
            raise

    def create_user(self, qq, name, pwd_hash):
        sql = """
        INSERT INTO users (qq, name, pwd_hash) 
        VALUES (%s, %s, %s)
        RETURNING id
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        qq,
                        name,
                        pwd_hash,
                    ),
                )
                user_id = cur.fetchone()[0]
                self.conn.commit()
                return user_id
        except Exception as e:
            self.conn.rollback()
            raise

    def update_user_info(self, id, introduction, pwd_hash, name, profile, contacts):
        sql = (
            "UPDATE users SET "
            + (f"introduction = '{introduction}'," if introduction else "")
            + (f"pwd_hash = '{pwd_hash}'," if pwd_hash else "")
            + (f"name = '{name}'," if name else "")
            + (f"profile_path = '{profile}'," if profile else "")
            + (f"contacts = '{contacts}'," if contacts else "")
        )
        sql = sql[:-1] + f" WHERE id = {id}"
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql)
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def set_admin(self, user_id, is_admin):
        sql = "UPDATE users SET is_admin = %s WHERE id = %s"
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (is_admin, user_id))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def admin_rebind_qq(self, user_id, qq):
        sql = """UPDATE users SET qq = %s WHERE id = %s"""
        check_sql = "SELECT id FROM users WHERE qq = %s AND id != %s"
        try:
            # 检测qq唯一
            with self.conn.cursor() as cur:
                cur.execute(check_sql, (qq, user_id))
                if cur.fetchone() is not None:
                    return False
                cur.execute(
                    sql,
                    (
                        qq,
                        user_id,
                    ),
                )
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_user(self, id):
        sql = "SELECT * FROM users WHERE id = %s"
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (id,))
                result = cur.fetchone()
                if result:
                    return {
                        "id": result[0],
                        "qq": result[1],
                        "hash": result[2],
                        "name": result[3],
                        "introduction": result[4],
                        "profile_path": self.minio_prefix + f"photo/{result[5]}",
                        "contacts": result[6],
                        "created_at": result[7],
                        "is_admin": result[8],
                    }
                else:
                    return None
        except Exception as e:
            self.conn.rollback()
            raise

    def search_user(self, field, value):
        sql = f"SELECT * FROM users WHERE {field} = %s"
        try:
            with self.conn.cursor() as cur:
                # print(sql % (str(value),))
                cur.execute(sql, (value,))
                result = cur.fetchone()
                if result is not None:
                    return {
                        "id": result[0],
                        "qq": result[1],
                        "hash": result[2],
                        "name": result[3],
                        "introduction": result[4],
                        "profile_path": self.minio_prefix + f"photo/{result[5]}",
                        "contacts": result[6],
                        "created_at": result[7],
                        "is_admin": result[8],
                    }
                else:
                    # print("User not found")
                    return None
        except Exception as e:
            self.conn.rollback()
            raise

    def list_users(self):
        sql = """
        SELECT id 
        FROM users
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql)
                result = cur.fetchall()
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def user_bind_game(self, user_id, game_id):
        sql = """
        INSERT INTO user_games (user_id, game_id) 
        VALUES (%s, %s)
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM user_games WHERE user_id = %s AND game_id = %s",
                    (user_id, game_id),
                )
                if cur.fetchone() is None:
                    cur.execute(sql, (user_id, game_id))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_user_games(self, user_id):
        sql = """
        SELECT game_id FROM user_games WHERE user_id = %s
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (user_id,))
                result = cur.fetchall()
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def user_unbind_game(self, user_id, game_id):
        sql = """
        DELETE FROM user_games WHERE user_id = %s AND game_id = %s
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        user_id,
                        game_id,
                    ),
                )
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def delete_user(self, user_id):
        sql = """
        DELETE FROM users WHERE id = %s
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (user_id,))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_image_type(self, game_id):
        sql = """
        SELECT * FROM game_images WHERE game_id = %s
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (game_id,))
                tup = cur.fetchone()
                result = []
                result.append(tup[1])
                if len(tup[2]) == 0:
                    return result
                screenshots = tup[2].split(",")
                for i in range(len(screenshots)):
                    result.append(screenshots[i])
                return result  # list
        except Exception as e:
            self.conn.rollback()
            raise

    def get_game(self, game_id, is_private=False):
        info = dict()
        game_info_list = self.get_game_info(game_id, is_private)
        if game_info_list is None:
            return None
        image_type = self.get_image_type(game_id)
        minio_prefix = self.minio_prefix
        info["id"] = game_info_list[0]
        info["title"] = game_info_list[1]
        info["description"] = game_info_list[6]
        info["cover_image"] = (
            f"{minio_prefix}images/{game_info_list[0]}/1.{image_type[0]}"
        )
        info["screenshots"] = []
        info["release_date"] = game_info_list[10].strftime("%Y-%m-%d")
        for i in range(2, len(image_type) + 1):
            info["screenshots"].append(
                f"{minio_prefix}images/{game_info_list[0]}/{i}.{image_type[i-1]}"
            )
        info["developers"] = []
        ids = game_info_list[8].split(",")
        for i in range(len(ids)):
            info["developers"].append(
                {"id": int(ids[i]), "name": self.get_user(ids[i])["name"]}
            )
        if len(game_info_list[7]) == 0:
            info["tags"] = []
        else:
            info["tags"] = game_info_list[7].split(",")
        info["download_url"] = f"{minio_prefix}games/{game_info_list[0]}/original.zip"
        if game_info_list[2] == "html":
            if game_info_list[3] == "fullscreen":
                info["online"] = {
                    "width": None,
                    "height": None,
                    "url": client.find_index_html_path(prefix=f"{game_info_list[0]}/"),
                }
            else:
                info["online"] = {
                    "width": game_info_list[4],
                    "height": game_info_list[5],
                    "url": client.find_index_html_path(prefix=f"{game_info_list[0]}/"),
                }
        info["size"] = game_info_list[12]
        return info

    def get_game_info1(self, game_id):
        """获取数据库中游戏所有字段,list"""
        sql = """SELECT * FROM games WHERE id = %s"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (game_id,),
                )
                result = cur.fetchone()
                if result is None:
                    return None
                else:
                    return list(result)
        except Exception as e:
            self.conn.rollback()
            raise

    def get_game1(self, game_id):
        info = dict()
        game_info_list = self.get_game_info1(game_id)
        if game_info_list is None:
            return None
        image_type = self.get_image_type(game_id)
        minio_prefix = self.minio_prefix
        info["id"] = game_info_list[0]
        info["title"] = game_info_list[1]
        info["description"] = game_info_list[6]
        info["cover_image"] = (
            f"{minio_prefix}images/{game_info_list[0]}/1.{image_type[0]}"
        )
        info["screenshots"] = []
        info["release_date"] = game_info_list[10].strftime("%Y-%m-%d")
        for i in range(2, len(image_type) + 1):
            info["screenshots"].append(
                f"{minio_prefix}images/{game_info_list[0]}/{i}.{image_type[i-1]}"
            )
        info["developers"] = []
        ids = game_info_list[8].split(",")
        for i in range(len(ids)):
            info["developers"].append(
                {"id": int(ids[i]), "name": self.get_user(ids[i])["name"]}
            )
        if len(game_info_list[7]) == 0:
            info["tags"] = []
        else:
            info["tags"] = game_info_list[7].split(",")
        info["download_url"] = f"{minio_prefix}games/{game_info_list[0]}/original.zip"
        if game_info_list[2] == "html":
            if game_info_list[3] == "fullscreen":
                info["online"] = {
                    "width": None,
                    "height": None,
                    "url": client.find_index_html_path(prefix=f"{game_info_list[0]}/"),
                }
            else:
                info["online"] = {
                    "width": game_info_list[4],
                    "height": game_info_list[5],
                    "url": client.find_index_html_path(prefix=f"{game_info_list[0]}/"),
                }
        info["size"] = game_info_list[12]
        return info

    def get_tag(self):
        sql = """SELECT * FROM tags """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, ())
                tup = cur.fetchall()
                result = []
                for i in range(len(tup)):
                    result.append(tup[i][0])
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def delete_tag(self, tag):
        sql = """DELETE FROM tags WHERE tag = %s"""
        try:
            with self.conn.cursor() as cur:
                result = cur.execute(sql, (tag,))
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def add_tag(self, tag):
        sql = """INSERT INTO tags (tag) VALUES (%s)"""
        try:
            with self.conn.cursor() as cur:
                result = cur.execute(sql, (tag,))
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def delete_all_tags(self):
        sql = """DELETE FROM tags"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql)
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_unreviewed_games(self):
        sql = """SELECT id FROM games WHERE is_private = True"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, ())
                ids = cur.fetchall()
                result = []
                for i in ids:
                    result.append(self.get_game(i, True))
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def add_comment(self, game_id, user_id, content):
        sql = """INSERT INTO comments (game_id, user_id, comment) VALUES (%s, %s, %s)
                RETURNING id"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        game_id,
                        user_id,
                        content,
                    ),
                )
                comment_id = cur.fetchone()[0]
                self.conn.commit()
                return comment_id
        except Exception as e:
            self.conn.rollback()
            raise

    def get_comments_by_gameid(self, game_id):
        sql = """SELECT id FROM comments WHERE game_id = %s"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (game_id,))
                ids = cur.fetchall()
                result = []
                for i in ids:
                    comment = self.get_comment(i[0])
                    if comment is not None:
                        result.append(self.pack_comment(comment))
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def get_comments_by_user_id(self, user_id):
        sql = """SELECT id FROM comments WHERE user_id = %s"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (user_id,))
                ids = cur.fetchall()
                result = []
                for i in ids:
                    comment = self.get_comment(i[0])
                    if comment is not None:
                        result.append(self.pack_comment(comment))
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def delete_comment(self, comment_id):
        sql = """DELETE FROM comments WHERE id = %s"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (comment_id,))
                self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_comment(self, comment_id):
        sql = """SELECT * FROM comments WHERE id = %s"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (comment_id,))
                result = cur.fetchone()
                return result
        except Exception as e:
            self.conn.rollback()
            raise

    def pack_comment(self, comment):
        """将评论元组转换为字典格式"""
        return {
            "id": comment[0],
            "user_id": comment[2],
            "user_name": self.get_user(comment[2])["name"],
            "user_profile": self.get_user(comment[2])["profile_path"],
            "game_id": comment[3],
            "created_time": comment[4].strftime("%Y-%m-%d %H:%M:%S"),
            "content": comment[1],
        }

    def check_owner(self, user_id, game_id):
        """检查用户是否为游戏的所有者"""
        sql = """SELECT * FROM user_games WHERE user_id = %s AND game_id = %s"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (user_id, game_id))
                result = cur.fetchone()
                if result is None:
                    return False
                else:
                    return True
        except Exception as e:
            self.conn.rollback()
            raise

    def rem_game(self):
        sql = """SELECT id, created_at, views FROM games WHERE is_private = False"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, ())
                result = cur.fetchall()
                if result is None:
                    return []
                top = sort_game(result)
                result = []
                for i in top:
                    result.append(self.get_game(i))
                return result
        except Exception as e:
            self.conn.rollback()
            raise


def calculate_recency_score(db_timestamp, base_score=10, decay_rate=0.1428):
    # 初始10分，每周减1分
    # db_time = datetime.fromisoformat(db_timestamp)
    db_time = db_timestamp
    if db_time.tzinfo is None:
        db_time = db_time.replace(tzinfo=timezone.utc)
    current_time = datetime.now(timezone.utc)
    delta_days = (current_time - db_time).total_seconds() / 86400
    score = base_score - delta_days * decay_rate
    return max(round(score, 2), 0)


def sort_game(game_list, top_n=3):
    new_game_list = []
    for game in game_list:
        # 热度权重 (60%)
        popularity = min(game[2] / 10, 10)  # 10次访问=1分（上限10）
        # 时效权重 (40%)
        recency = calculate_recency_score(game[1])
        score = 0.6 * popularity + 0.4 * recency
        new_game_list.append((score, game[0]))

    sorted_games = sorted(new_game_list, reverse=True)
    # print(sorted_games)
    res = []
    for i in sorted_games[:top_n]:
        res.append(i[1])
    return res
