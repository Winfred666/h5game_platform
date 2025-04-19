CREATE TYPE game_kind AS ENUM ('html', 'windows', 'mac', 'linux', 'android', 'ios');

CREATE TABLE games (
    id SERIAL PRIMARY KEY,  -- 自增整数
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(500),
    kind game_kind NOT NULL,
    embed_op VARCHAR(50) CHECK (embed_op IN ('embed_in_page', 'open_in_new')),
    width INTEGER,
    height INTEGER,
    description TEXT,
    genre VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    views BIGINT DEFAULT 0,
    downloads BIGINT DEFAULT 0,
    author_ids INTEGER[],
    is_private BOOLEAN DEFAULT FALSE
);

CREATE TABLE game_images (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    image_type VARCHAR(20) CHECK (image_type IN ('cover', 'screenshot')),
    minio_path VARCHAR(255) NOT NULL,
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_game_images ON game_images(game_id, image_type);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(8) NOT NULL,
    email VARCHAR(50) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    background VARCHAR(255),
    profile_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_games (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, game_id)
);