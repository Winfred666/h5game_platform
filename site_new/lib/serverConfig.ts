import "server-only";

import { db } from "./dbInit";

// running only server side

export const MINIO_CONCURRENT_WORKERS = 10; // Max concurrent uploads request to MinIO

export const AVATAR_SIZE = 200;

export const AVATAR_WEBP_QUALITY = 70;

export const GAMEIMG_WEBP_QUALITY = 80;

export const COOKIES_PREFIX = "h5game_";

export const MINIO_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export const SALT_ROUNDS = 10; // bcrypt salt rounds

export const DEFAULT_HASH_KEY = "DEFAULT_HASH";


export async function getConfigurationValue(key: string): Promise<string> {
  const config = await db.configuration.findUnique({
    where: { key },
  });
  if (!config) {
    throw new Error(`Configuration key "${key}" not found`);
  }
  return config?.value;
}

export async function setConfigurationValue(key: string, value: string) {
  return db.configuration.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}