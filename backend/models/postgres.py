import psycopg2
from psycopg2.extras import Json

class GameDB:
    def __init__(self):
        self.conn = psycopg2.connect(
            host="localhost",
            database="game_metadata",
            user="postgres",
            password="postgres"
        )
    '''
    game_data 是一个 Python 字典,应为
    game_data = {
    # 必填字段
    "title": "游戏名称",
    "minio_path": "minio存储路径/game123",
    
    # 可选字段（有默认值）
    "file_size": 102400,  # 字节数
    "tagline": "简短描述",  # 默认为None
    "kind": "html",  # 游戏类型，默认为None
    "embed_op": "embed_in_page",  # 默认为'embed_in_page'
    "width": 800,  # 默认为None
    "height": 600,  # 默认为None
    "description": "完整描述",  # 默认为None
    "genre": "冒险",  # 默认为None
    "author_id": "uuid-string",  # 默认为None
    "is_private": False  # 默认为False
    }
    '''
    """创建游戏元数据（返回自增整数ID）"""
    def create_game(self, game_data):
        sql = """
        INSERT INTO games (
            title, tagline, kind, embed_op, width, height,
            description, genre, minio_path, file_size,
            author_id, is_private
        ) VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s
        )
        RETURNING id
        """
        try:
            with self.conn.cursor() as cur:
                cur.execute(sql, (
                    game_data['title'],
                    game_data.get('tagline'),  
                    game_data.get('kind','html'),     
                    game_data.get('embed_op', 'embed_in_page'),
                    game_data.get('width'),
                    game_data.get('height'),
                    game_data.get('description'),
                    game_data.get('genre'),    
                    game_data['minio_path'],
                    game_data.get('file_size',0),
                    game_data.get('author_id'),
                    game_data.get('is_private', False)
                ))
                game_id = cur.fetchone()[0]
                self.conn.commit()
                return game_id
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
            return cur.fetchone()
    
    def update_game_stats(self, game_id, field):
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