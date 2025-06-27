import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Schema } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const processClientWorkload = (
  params: unknown,
  validator: Schema<any>
): any => {
  const validation = validator.safeParse(params);
  if (!validation.success) {
    throw new Error("Invalid parameters: " + validation.error.message);
  }
  return validation.data;
};

export const genGamePlayableURL = (gameId: number) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/games/${gameId}/index.html`;

export const genGameCoverURL = (gameId: number) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/images/${gameId}/cover.webp`;

export const genGameScreenshotsURL = (
  gameId: number,
  screenshotNum: number
) => {
  const screenshotsURL = [];
  for (let i = 0; i < screenshotNum; i++) {
    screenshotsURL.push(
      `${process.env.NEXT_PUBLIC_MINIO_URL}/images/${gameId}/screenshot${i}.webp`
    );
  }
  return screenshotsURL;
};

export const genGameDownloadURL = (gameId: number) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/games/${gameId}/game.zip`;

export const genUserAvatarURL = (userId: number) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/photo/${userId}.webp`;

export const byteToMB = (bytes: number): string =>
  (bytes / (1024 * 1024)).toFixed(2) + " MB";


const customReplacer = (key: string, value: any) => {
  if (value === null) {
    return undefined; // remove null values!! to ensure serializability
  }
  return value; // return other values as is
};

Date.prototype.toJSON = function () {
  return this.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const convertToPlainObj = (data: any): any => JSON.parse(JSON.stringify(data, customReplacer));
