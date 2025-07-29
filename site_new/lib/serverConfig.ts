"server-only"

export enum MINIO_BUCKETS{
  GAME="games", 
  UNAUDIT_GAME="unaudit-games", // private, visit with temp token.
  IMAGE="images", 
  AVATAR="avatars",
};

// savely add private
export const genGamePlayableURL = (gameId: number, isPrivate: boolean) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/${isPrivate ? MINIO_BUCKETS.UNAUDIT_GAME : MINIO_BUCKETS.GAME}/${gameId}/index.html`;

export const genGameCoverURL = (gameId: number) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/${MINIO_BUCKETS.IMAGE}/${gameId}/cover.webp`;

export const genGameScreenshotsURL = (
  gameId: number,
  screenshotNum: number
) => {
  const screenshotsURL = [];
  for (let i = 0; i < screenshotNum; i++) {
    screenshotsURL.push(
      `${process.env.NEXT_PUBLIC_MINIO_URL}/${MINIO_BUCKETS.IMAGE}/${gameId}/screenshot${i}.webp`
    );
  }
  return screenshotsURL;
};

export const genGameDownloadURL = (gameId: number, isPrivate: boolean) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/${isPrivate ? MINIO_BUCKETS.UNAUDIT_GAME : MINIO_BUCKETS.GAME}/${gameId}/game.zip`;

export const genUserAvatarURL = (userId: number) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/${MINIO_BUCKETS.AVATAR}/${userId}.webp`;


export const MINIO_CONCURRENT_WORKERS = 10; // Max concurrent uploads request to MinIO

export const AVATAR_SIZE = 200;

export const AVATAR_WEBP_QUALITY = 70;

export const GAMEIMG_WEBP_QUALITY = 80;

export const COOKIES_PREFIX = "h5game_";

export const MINIO_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export const SALT_ROUNDS = 10; // bcrypt salt rounds