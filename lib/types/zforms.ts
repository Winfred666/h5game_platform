// FileList must used in client-side
import { z } from "zod";
import {
  AvatarSchema,
  CoverSchema,
  OptionalCoverSchema,
  OptionalZipSchema,
  ScreenshotsSchema,
  ZipSchema,
} from "./zfiles";
import { formDataToObject } from "../utils";
import { BooleanSchema, IDSchema, PasswordSchema, QQSchema, URLSchema } from "./zparams";

// const StringToNumberOptSchema = z
//   .string()
//   .transform((w) => (w === "" ? undefined : parseInt(w)))
//   .pipe(z.number().int().positive().optional());

// WARNING: any schema should be both client + server schema to make it consistant.
// WARNING: should not use optional()/default(), all raw_input should be string()
// to avoid undefined value which turn component uncontrolled.

// WARNING: single File is not allowed, only File list or better File[]

const GameFormPrimitiveSchema = z.object({
  // because controlled react component cannot receive undefined as value.
  title: z.string().min(1, "标题不允许为空").max(50, "标题不能超过50个字符"),
  kind: z
    .enum(["downloadable", "html", ""])
    .refine((k) => k !== "", "请选择游戏类型"),
  // .transform((k) => k || "downloadable"), // should not use transform

  uploadfile: ZipSchema,
  embed_op: z.enum(["embed_in_page", "fullscreen", ""]),
  // first define a placeholder, then for optional value just transform
  width: z
    .string()
    .refine(
      (z) => z === "" || (/^\d+$/.test(z) && parseInt(z) > 0),
      "宽度必须为正整数"
    ),
  height: z
    .string()
    .refine(
      (z) => z === "" || (/^\d+$/.test(z) && parseInt(z) > 0),
      "高度必须为正整数"
    ),
  description: z.string(),
  tags: z.array(IDSchema),
  // need name to show.
  developers: z.array(
    z.object({ id: IDSchema, name: z.string() })
  ),
  cover: CoverSchema,
  screenshots: z.object({
    add: ScreenshotsSchema,
    delete: z.array(z.number()),
  }),
});

// WARNING: should not break the calling chain of zod, cannot use wrapper function
const clientGameValidation = (
  form: z.input<typeof GameFormPrimitiveSchema>
) => {
  // post refine depends on multi field, must have width and height
  if (form.kind === "html") {
    return (
      form.embed_op &&
      (form.embed_op === "fullscreen" || (form.width && form.height))
    );
  }
  return true;
};
const clientGameValidationError =
  "HTML 嵌入必须指定窗口尺寸（可用引擎查看场景像素宽高），否则用全屏模式";

export const GameFormInputSchema = GameFormPrimitiveSchema.strip().refine(
  clientGameValidation,
  clientGameValidationError
);

export type GameFormInputType = z.input<typeof GameFormInputSchema>;

export const IncreGameFormInputSchema = GameFormPrimitiveSchema.extend({
  uploadfile: OptionalZipSchema,
  cover: OptionalCoverSchema,
})
  .strip()
  .refine(clientGameValidation, clientGameValidationError);

const serverGameTransform = (form: GameFormInputType) => {
  return {
    ...form,
    kind: undefined,
    embed_op: undefined,
    isOnline: form.kind === "html",
    width: form.embed_op === "embed_in_page" ? parseInt(form.width) : null,
    height: form.embed_op === "embed_in_page" ? parseInt(form.height) : null,
    developers: form.developers.map((dev: { id: string }) => ({
      id: dev.id,
    })),
    tags: form.tags.map((tagId: string) => ({ id: tagId })),
  };
};

// transform is available in ServerSchema ; and any preprocess should only write in serverSchema to do server-side validtaion.
export const GameFormServerSchema = z
  .instanceof(FormData)
  .transform(formDataToObject)
  .pipe(GameFormInputSchema.transform(serverGameTransform));

export const IncreGameFormServerSchema = z
  .instanceof(FormData)
  .transform(formDataToObject)
  .pipe(IncreGameFormInputSchema.transform(serverGameTransform));

export const LoginFormInputSchema = z.object({
  qq: QQSchema,
  password: PasswordSchema,
});

export type LoginFormInputType = z.input<typeof LoginFormInputSchema>;

const userContactWaySchema = z
  .string()
  .min(1, "联系方式不能为空")
  .refine(
    (val) => !val.includes(",") && !val.includes(":"),
    "联系方式不能包含“，” 和 “：”"
  );

const NameSchema = z
  .string()
  .min(1, "昵称不能为空")
  .max(50, "昵称不能超过50个字符");

export const UserUpdateFormInputSchema = z
  .object({
    name: NameSchema,
    // could leave as empty string, meaning no change.
    password: z.union([z.literal(""), PasswordSchema]),
    introduction: z.string().default(""),
    avatar: AvatarSchema,
    contacts: z.array(
      z.object({
        way: userContactWaySchema,
        content: userContactWaySchema,
      })
    ),
  })
  .strip();

export type UserUpdateFormInputType = z.input<typeof UserUpdateFormInputSchema>;

export const UserUpdateFormServerSchema = z
  .instanceof(FormData)
  .transform(formDataToObject)
  .pipe(
    UserUpdateFormInputSchema.transform((form) => ({
      ...form, // do not set password if leaves empty string
      password: form.password.length > 0 ? form.password : undefined,
      hasAvatar: form.avatar.length > 0 ? true : undefined, // from 0 to 1 or no change
      contacts: form.contacts
        .map((contact) => `${contact.way}:${contact.content}`)
        .join(","),
    }))
  );

export const AddUserServerSchema = z.array(
  z.object({
    name: NameSchema,
    qq: QQSchema,
    isAdmin: BooleanSchema,
    avatar: URLSchema,
  })
);

export const UserAdminEditServerSchema = z.object({
  id: IDSchema,
  qq: QQSchema,
  isAdmin: z.boolean().default(false),
  resetPassword: z.boolean().default(false),
});
