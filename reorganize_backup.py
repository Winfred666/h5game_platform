"""
Reorganize H5 platform backup into per-game folders with assets and introduction.md
Usage:
  python reorganize_backup.py
"""

import sqlite3
import os
import shutil

backup_dir = "h5game_backup"
output_dir = "reorganized_games"

SQL_ALL_GAMES = """
SELECT
  g.id,
  g.title,
  g.description,
  g.size,
  g.screenshot_count,
  g.is_online,
  g.is_private,
  g.views,
  g.created_at,
  g.updated_at,
  GROUP_CONCAT(DISTINCT t.name) AS tags,
  GROUP_CONCAT(DISTINCT u.name) AS developers
FROM game AS g
LEFT JOIN _GameToTag AS gt ON gt.A = g.id
LEFT JOIN tag AS t ON t.id = gt.B
LEFT JOIN _GameToUser AS gu ON gu.A = g.id
LEFT JOIN "user" AS u ON u.id = gu.B
GROUP BY g.id
ORDER BY g.updated_at DESC;
"""
def unpack_and_remove(path: str):
    """Unpack zip to dest and delete zip if unpack succeeded."""
    if os.path.exists(f"{path}.zip"):
        shutil.unpack_archive(f"{path}.zip", path)
        # os.remove(f"{path}.zip")
        return True
    else:
        return False

def reorganize_backup():
    """重组备份数据为可读格式"""
    global backup_dir, output_dir
    if not unpack_and_remove(backup_dir):
        print(f"Error: {backup_dir}.zip not exist")
        exit()

    db_path = f"{backup_dir}/db/prod.db"
    minio_game_path = f"{backup_dir}/minio/games"
    minio_unaudited_game_path = f"{backup_dir}/minio/unaudit-games"
    minio_image_path = f"{backup_dir}/minio/images"

    # 3 minio buckets are all zip file, first unzip to the same folder
    if not unpack_and_remove(minio_game_path):
        os.makedirs(minio_game_path, exist_ok=True)
    if unpack_and_remove(minio_unaudited_game_path):
        for item in os.listdir(minio_unaudited_game_path):
            s = os.path.join(minio_unaudited_game_path, item)
            d = os.path.join(minio_game_path, item)
            if os.path.isdir(s):
                shutil.move(s, d)
    unpack_and_remove(minio_image_path)
    
    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)

    # 连接数据库
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # 允许按列名访问
    cursor = conn.cursor()

    # 查询所有游戏信息
    cursor.execute(SQL_ALL_GAMES)

    rows = cursor.fetchall()
    # convert sqlite3.Row -> dict so .get() works in helpers
    games = [dict(r) for r in rows]

    print(f"📦 发现 {len(games)} 个游戏，开始重组...")

    for game in games:
        game_id = game["id"]
        game_title = game["title"] or f"game_{game_id}"

        # 创建游戏目录（使用标题作为文件夹名）
        safe_title = "".join(
            c for c in game_title if c.isalnum() or c in (" ", "-", "_")
        ).rstrip()
        game_output_dir = f"{output_dir}/{safe_title}"
        os.makedirs(game_output_dir, exist_ok=True)

        # 复制游戏文件
        game_source_dir = f"{minio_game_path}/{game_id}"
        game_image_dir = f"{minio_image_path}/{game_id}"

        if os.path.exists(game_source_dir):
            print(f"📁 复制游戏文件: {game_title}")
            for item in os.listdir(game_source_dir):
                src = os.path.join(game_source_dir, item)
                dst = os.path.join(game_output_dir, item)
                if os.path.isfile(src):
                    shutil.copy2(src, dst)
                elif os.path.isdir(src):
                    shutil.copytree(src, dst, dirs_exist_ok=True)
        if os.path.exists(game_image_dir):
            os.makedirs(os.path.join(game_output_dir, "assets"), exist_ok=True)
            for item in os.listdir(game_image_dir):
                shutil.copy2(
                    os.path.join(game_image_dir, item),
                    os.path.join(game_output_dir, "assets", item),
                )
        # 创建游戏信息 Markdown 文件
        create_game_markdown(game, game_output_dir)

    conn.close()
    print(f"✅ 数据重组完成！输出目录: {output_dir}")


def create_game_markdown(game, output_dir):
    """为每个游戏创建 introduction.md 文件"""
    tags = (game["tags"] or "").split(",") if game["tags"] else []

    developers = (game["developers"] or "").split(",") if game["developers"] else []

    # Prepare screenshots markup outside the f-string to avoid backslash in expression
    screenshot_count = game.get("screenshot_count") or 0
    screenshot_lines = []
    for i in range(screenshot_count):
        screenshot_lines.append(f"![游戏截图{i}](assets/screenshot{i}.webp)")
    screenshots_md = "\n\n".join(screenshot_lines)

    cover_md = "![封面图](assets/cover.webp)\n"  # keep even if cover may be missing

    title = game.get("title") or f"game_{game.get('id')}"
    description = game.get("description") or "暂无介绍"
    size_bytes = game.get("size") or 0
    size_mb = round(size_bytes / (1024 * 1024), 2)

    md_lines = [
        f"# {title}",
        "",
        cover_md if cover_md else "",
        "",
        "## 游戏介绍",
        "",
        screenshots_md,
        "",
        description,
        "",
        "## 标签",
        "",
        ", ".join(tags) if tags else "暂无标签",
        "",
        "## 开发者",
        "",
        ", ".join(developers) if developers else "暂无开发者信息",
        "",
        "## 元信息",
        "",
        f"- **游戏ID**: {game.get('id')}",
        f"- **文件大小**: {size_mb} MB",
        "",
        "*此文件由 H5游戏平台备份数据自动生成*",
        "",
    ]
    md_content = "\n".join(filter(None, md_lines))
    with open(f"{output_dir}/introduction.md", "w", encoding="utf-8") as f:
        f.write(md_content)
if __name__ == "__main__":
    reorganize_backup()
