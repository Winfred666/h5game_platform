// FileList must used in client-side
import { z } from "zod";
import {
  AvatarSchema,
  CoverSchema,
  OptionalCoverSchema,
  OptionalZipSchema,
  ScreenshotsSchema,
} from "./zfiles";
import {
  BooleanSchema,
  IDSchema,
  NameSchema,
  PasswordSchema,
  QQSchema,
  URLSchema,
} from "./zparams";

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
    .enum(["downloadable", "html", "jump", ""])
    .refine((k) => k !== "", "请选择游戏类型"),
  // .transform((k) => k || "downloadable"), // should not use transform

  // html only options.
  useSharedArrayBuffer: z.boolean(),

  // html + embed only options.
  enableScrollbars: z.boolean(),
  isAutoStarted: z.boolean(),
  hasFullscreenButton: z.boolean(),

  uploadfile: OptionalZipSchema, // could be empty array if selecting 'jump' kind,

  embed_op: z.enum(["embed", "fullscreen"]),

  jumpUrl: z.union([URLSchema, z.literal("")]), // could be empty string if not 'jump' kind

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
  developers: z.array(z.object({ id: IDSchema, name: z.string() })),
  cover: CoverSchema,
  screenshots: z.object({
    add: ScreenshotsSchema,
    delete: z.array(z.number()),
  }),
});

// WARNING: should not break the calling chain of zod, cannot use wrapper function
const clientGameEmbedValidation = (
  form: z.input<typeof GameFormPrimitiveSchema>
) => {
  // post refine depends on multi field, like html+embed type must have width and height
  if (form.kind === "html") {
    return (form.embed_op === "fullscreen" ||
        (form.embed_op === "embed" && form.width && form.height)
    );
  }
  return true;
};

const clientGameJumpValidation = (
  form: z.input<typeof GameFormPrimitiveSchema>
) => {
  if (form.kind === "jump") {
    return form.jumpUrl !== "";
  }
  return true;
};

const clientGameZipValidation = (
  form: z.input<typeof GameFormPrimitiveSchema>
) => {
  if (form.kind === "downloadable" || form.kind === "html") {
    return form.uploadfile.length === 1;
  }
  return true;
};

const clientGameEmbedValidationError =
  "HTML 嵌入必须指定窗口尺寸（可用引擎查看场景像素宽高），否则用全屏模式";

const clientGameJumpValidationError = "跳转外链必须指定合法链接";

const clientGameZipValidationError = "HTML/只下载游戏都必须上传游戏包体";

export const GameFormInputSchema = GameFormPrimitiveSchema.strip()
  .refine(clientGameEmbedValidation, clientGameEmbedValidationError)
  .refine(clientGameJumpValidation, clientGameJumpValidationError)
  .refine(clientGameZipValidation, clientGameZipValidationError);

export type GameFormInputType = z.input<typeof GameFormInputSchema>;

export const IncreGameFormInputSchema = GameFormPrimitiveSchema.extend({
  cover: OptionalCoverSchema,
})
  .strip()
  .refine(clientGameEmbedValidation, clientGameEmbedValidationError)
  .refine(clientGameJumpValidation, clientGameJumpValidationError);


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


export const AddUserInputSchema = z.array(
  z.object({
    name: NameSchema,
    qq: QQSchema,
    isAdmin: BooleanSchema,
    avatar: URLSchema,
  })
);

export const UserAdminEditInputSchema = z.object({
  id: IDSchema,
  qq: QQSchema,
  isAdmin: z.boolean().default(false),
  resetPassword: z.boolean().default(false),
});
