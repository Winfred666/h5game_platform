"""
Reorganize H5 platform backup into per-game folders with assets and introduction.md
Usage:
  python reorganize_backup.py

Updated: Adapted to new Game.assetsType (assets_type) encoding.
"""

import sqlite3
import os
import shutil
from datetime import datetime

backup_dir = "h5game_backup"
output_dir = "reorganized_games"

# Updated SQL: remove deprecated boolean columns, add assets_type
SQL_ALL_GAMES = """
SELECT
  g.id,
  g.title,
  g.assets_type,
  g.description,
  g.size,
  g.screenshot_count,
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
        # WARNING: if there is nothing but only game.zip inside, unpack also
        if os.path.exists(f"{path}/game.zip"):
            shutil.unpack_archive(f"{path}/game.zip", path)
            os.remove(f"{path}/game.zip")
        return True
    else:
        return False

# --- assetsType parsing helpers ---

def _to_bool(v: str) -> bool:
    return str(v).strip() in {"1", "true", "True", "yes", "on"}

def parse_assets_type(assets_type: str):
    """Parse the compact assets_type string into a structured dict.

    Formats:
      "" (empty)                         -> download only
      "fullscreen|<useSharedArrayBuffer>" -> fullscreen online
      "embed|w|h|sab|auto|fsBtn|scroll"  -> embedded iframe online
      "jump|<url>"                       -> external jump
    All numeric flag fields are 0/1.
    """
    if not assets_type:
        return {
            "mode": "download",
            "label": "离线下载游戏",
            "summary": "离线下载（无在线运行模式）",
            "flags": {},
        }
    parts = assets_type.split("|")
    kind = parts[0]
    if kind == "fullscreen":
        use_sab = _to_bool(parts[1]) if len(parts) > 1 else False
        return {
            "mode": "fullscreen",
            "label": "全屏在线",
            "summary": f"全屏在线{' (SharedArrayBuffer)' if use_sab else ''}",
            "flags": {"useSharedArrayBuffer": use_sab},
        }
    if kind == "embed":
        # width|height|useSharedArrayBuffer|isAutoStarted|hasFullscreenButton|enableScrollbars
        width = parts[1] if len(parts) > 1 else "?"
        height = parts[2] if len(parts) > 2 else "?"
        use_sab = _to_bool(parts[3]) if len(parts) > 3 else False
        auto = _to_bool(parts[4]) if len(parts) > 4 else False
        fs_btn = _to_bool(parts[5]) if len(parts) > 5 else False
        scroll = _to_bool(parts[6]) if len(parts) > 6 else False
        return {
            "mode": "embed",
            "label": "内嵌在线",
            "summary": f"内嵌 {width}x{height} 在线游戏",
            "width": width,
            "height": height,
            "flags": {
                "useSharedArrayBuffer": use_sab,
                "isAutoStarted": auto,
                "hasFullscreenButton": fs_btn,
                "enableScrollbars": scroll,
            },
        }
    if kind == "jump":
        url = parts[1] if len(parts) > 1 else "(缺失URL)"
        return {
            "mode": "jump",
            "label": "外链跳转",
            "summary": f"跳转到外部地址: {url}",
            "url": url,
            "flags": {},
        }
    # Fallback / unknown
    return {
        "mode": "unknown",
        "label": "未知模式",
        "summary": f"未识别的 assets_type: {assets_type}",
        "raw": assets_type,
        "flags": {},
    }

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
    games = [dict(r) for r in rows]

    print(f"📦 发现 {len(games)} 个游戏，开始重组...")

    for game in games:
        game_id = game["id"]
        game_title = game["title"] or f"game_{game_id}"

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
    # delete the unpacked backup folder to save space
    shutil.rmtree(backup_dir)
    print(f"✅ 数据重组完成！输出目录: {output_dir}")


def create_game_markdown(game, output_dir):
    """为每个游戏创建 introduction.md 文件"""
    tags = (game["tags"] or "").split(",") if game.get("tags") else []
    developers = (game["developers"] or "").split(",") if game.get("developers") else []

    screenshot_count = game.get("screenshot_count") or 0
    screenshot_lines = [f"![游戏截图{i}](assets/screenshot{i}.webp)" for i in range(screenshot_count)]
    screenshots_md = "\n\n".join(screenshot_lines)

    cover_md = "![封面图](assets/cover.webp)\n"

    title = game.get("title") or f"game_{game.get('id')}"
    description = game.get("description") or "暂无介绍"
    size_bytes = game.get("size") or 0
    size_mb = round(size_bytes / (1024 * 1024), 2)

    assets_info = parse_assets_type(game.get("assets_type") or "")

    # Build flags markdown (only show True flags)
    true_flags = [
        name for name, val in assets_info.get("flags", {}).items() if val
    ]
    flags_md = ", ".join(true_flags) if true_flags else "无"

    # Dates (format friendly)
    def fmt_ts(ts):
        """Format various timestamp representations to 'YYYY-MM-DD HH:MM:SS'.
        Supports:
        - Epoch seconds, milliseconds, microseconds (int/str)
        - ISO strings (e.g., 2025-09-19T03:42:07.123Z)
        - Common 'YYYY-MM-DD HH:MM:SS' strings
        """
        if ts is None or ts == "":
            return ""
        try:
            # Numeric (or numeric string)
            if isinstance(ts, (int, float)) or (isinstance(ts, str) and ts.strip().lstrip("-+").isdigit()):
                v = int(str(ts).strip())
                # Detect unit by magnitude
                if abs(v) >= 1_000_000_000_000_000:  # microseconds
                    seconds = v / 1_000_000
                elif abs(v) >= 1_000_000_000_00:     # milliseconds
                    seconds = v / 1_000
                else:                                 # seconds
                    seconds = v
                dt = datetime.fromtimestamp(seconds)
                return dt.strftime("%Y-%m-%d %H:%M:%S")

            # String timestamps
            s = str(ts).strip()
            # Handle trailing Z as UTC
            s2 = s[:-1] + "+00:00" if s.endswith("Z") else s
            try:
                dt = datetime.fromisoformat(s2)
                # Convert aware dt to local time for readability
                if dt.tzinfo is not None:
                    dt = dt.astimezone()
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                pass

            # Fallback known patterns
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    dt = datetime.strptime(s, fmt)
                    return dt.strftime("%Y-%m-%d %H:%M:%S")
                except Exception:
                    continue

            return s
        except Exception:
            return str(ts)

    md_lines = [
        f"# {title}",
        "",
        cover_md,
        "",
        "## 游戏介绍",
        "",
        screenshots_md,
        "",
        description,
        "",
        "## 运行方式",
        "",
        f"- 概述: {assets_info['summary']}",
    ]

    if assets_info.get("mode") == "embed":
        md_lines.extend([
            f"- 尺寸: {assets_info.get('width')} x {assets_info.get('height')}",
        ])
    if assets_info.get("mode") == "jump":
        md_lines.extend([
            f"- 外链: {assets_info.get('url')}",
        ])

    md_lines.extend([
        f"- 标志(启用): {flags_md}",
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
        f"- 游戏ID: {game.get('id')}",
        f"- 文件大小: {size_mb} MB",
        f"- 浏览量: {game.get('views')}",
        f"- 私有: {'是' if game.get('is_private') else '否'}",
        f"- 创建时间: {fmt_ts(game.get('created_at'))}",
        f"- 更新时间: {fmt_ts(game.get('updated_at'))}",
        "",
        "*此文件由 H5游戏平台备份数据自动生成*",
        "",
    ])

    md_content = "\n".join(line for line in md_lines if line is not None)
    with open(f"{output_dir}/introduction.md", "w", encoding="utf-8") as f:
        f.write(md_content)
        

if __name__ == "__main__":
    reorganize_backup()
