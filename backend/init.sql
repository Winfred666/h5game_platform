CREATE TABLE games (
    id SERIAL PRIMARY KEY,  -- 自增整数 
    title VARCHAR(50) NOT NULL,  --1
    kind VARCHAR(20) NOT NULL,  --2
    is_online VARCHAR(20) NOT NULL,--3
    width INTEGER DEFAULT NULL,--4
    height INTEGER DEFAULT NULL,--5
    description TEXT,--6
    genre VARCHAR(100),--7
    author_ids VARCHAR(100),--8
    is_private BOOLEAN DEFAULT True,--9
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),--10
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),--11
    size BIGINT DEFAULT 0, --12
    views BIGINT DEFAULT 0,--13
    downloads BIGINT DEFAULT 0
);

CREATE TABLE game_images (
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    cover_type VARCHAR(10) ,
    screenshot_type VARCHAR(20)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    qq VARCHAR(50) UNIQUE NOT NULL,
    pwd_hash VARCHAR(256) NOT NULL,
    name VARCHAR(100) NOT NULL,
    introduction TEXT,
    profile_path VARCHAR(255),
    contacts TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_games (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, game_id)
);

CREATE TABLE tags (
    tag VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,  
    comment TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO tags (tag) VALUES
    ('动作'),
    ('冒险'),
    ('角色扮演'),
    ('模拟'),
    ('策略'),
    ('体育'),
    ('竞速'),
    ('益智'),
    ('射击'),
    ('格斗'),
    ('平台跳跃'),
    ('恐怖'),
    ('生存'),
    ('潜行'),
    ('大型多人在线角色扮演'),
    ('沙盒'),
    ('开放世界'),
    ('视觉小说'),
    ('音乐节奏'),
    ('卡牌游戏'),
    ('塔防'),
    ('回合制'),
    ('即时战略'),
    ('类银河战士恶魔城'),
    ('Roguelike'),
    ('城市建造'),
    ('经营管理'),
    ('合成/制作'),
    ('建造'),
    ('叙事'),
    ('派对游戏'),
    ('休闲'),
    ('合作'),
    ('多人游戏'),
    ('单人游戏'),
    ('在线对战'),
    ('本地多人'),
    ('大逃杀'),
    ('战术'),
    ('3D'),
    ('2D'),
    ('像素风'),
    ('动漫'),
    ('奇幻'),
    ('科幻'),
    ('历史'),
    ('西部'),
    ('赛博朋克'),
    ('悬疑'),
    ('喜剧'),
    ('复古');