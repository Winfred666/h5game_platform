import { z } from "zod";
import { byteToMB } from "../utils";
import {
  ACCEPTED_IMG_MINE_TYPES,
  ACCEPTED_ZIP_MIME_TYPES,
  MAX_IMG_SIZE,
  MAX_SCREENSHOT_NUMBER,
  MAX_ZIP_SIZE,
} from "../clientConfig";

// use for both client and server, so in clientConfig.

// Required ZIP schema
const ZipSchema = z.array(z.any()).superRefine((value, ctx) => {
  if (!value || value.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "需要上传一个 .zip 游戏包体",
    });
    return false;
  }

  const file = value[0];

  // Size validation
  if (file.size > MAX_ZIP_SIZE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `zip 最大大小为 ${byteToMB(MAX_ZIP_SIZE)}MB`,
    });
    return false;
  }

  // MIME type validation
  if (!ACCEPTED_ZIP_MIME_TYPES.includes(file.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `只能上传 .zip 类型的包体。`,
    });
    return false;
  }
  return true;
});

// Optional ZIP schema
export const OptionalZipSchema = z.union([
  ZipSchema,
  z.array(z.any()).length(0), // an empty array is also valid
]);

export const ScreenshotsSchema = z
  .array(z.any())
  .superRefine((fileArr, ctx) => {
    if (fileArr.length > MAX_SCREENSHOT_NUMBER) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `最多只能上传 ${MAX_SCREENSHOT_NUMBER} 张图片。`,
      });
      return false;
    }
    // 检查每个文件的大小
    if (fileArr.some((file) => file.size > MAX_IMG_SIZE)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `每张图片大小不能超过 ${byteToMB(MAX_IMG_SIZE)}。`,
      });
      return false;
    }
    // 检查每个文件的类型
    if (fileArr.some((file) => !ACCEPTED_IMG_MINE_TYPES.includes(file.type))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `只接受 ${ACCEPTED_IMG_MINE_TYPES.join(",")} 格式的图片。`,
      });
      return false;
    }
  });


// must have, cannot be empty
export const CoverSchema = z
  .array(z.any())
  .superRefine((value, ctx) => {
  // 空值检查 - 如果没提供文件，封面图是必需的
  if (!value || value.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "需要上传一张封面图",
      });
      return false;
  }

  const file = value[0];
  // 文件大小检查
  if (file.size > MAX_IMG_SIZE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `封面图最大大小为 ${byteToMB(MAX_IMG_SIZE)}MB`,
    });
    return false;
  }
  // 文件类型检查
  if (!ACCEPTED_IMG_MINE_TYPES.includes(file.type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `封面图只能是 ${ACCEPTED_IMG_MINE_TYPES.join(", ")} 格式。`,
    });
    return false;
  }
});

export const OptionalCoverSchema = z.union([
  CoverSchema,
  z.array(z.any()).length(0), // an empty array is also valid
]);

// optional , can be empty
export const AvatarSchema = z
  .array(z.any())
  .superRefine((value, ctx) => {
    // 空值检查 - 如果没提供文件，头像是可选项
    if (!value || value.length === 0) {
      return; // 通过测试
    }
    const file = value[0];
    // 文件大小检查
    if (file.size > MAX_IMG_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `头像大小不能超过 ${byteToMB(MAX_IMG_SIZE)}`,
      });
      return false;
    }
    // 文件类型检查
    if (!ACCEPTED_IMG_MINE_TYPES.includes(file.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "请上传有效的图片文件",
      });
      return false;
    }
  });
// .transform((files) => files?.[0] ?? undefined);
