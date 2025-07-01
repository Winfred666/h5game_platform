"server-only"

export enum MINIO_BUCKETS{
  GAME="games", 
  UNAUDIT_GAME="unaudit-games", // private, visit with temp token.
  IMAGE="images", 
  AVATAR="avatars",
};

export const AVATAR_SIZE = 200;

export const AVATAR_WEBP_QUALITY = 70;

export const GAMEIMG_WEBP_QUALITY = 80;

export const COOKIES_PREFIX = "h5game_";

export const MINIO_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export const SALT_ROUNDS = 10; // bcrypt salt rounds