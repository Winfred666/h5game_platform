// FileList must used in client-side
import { z } from "zod";
import { CoverSchema, ScreenshotsSchema, ZipSchema } from "./zfiles";
// WARNING: because ZipSchema will do transfer, it is only client-side schema.

// const StringToNumberOptSchema = z
//   .string()
//   .transform((w) => (w === "" ? undefined : parseInt(w)))
//   .pipe(z.number().int().positive().optional());

export const GameFormSchema = z
  .object({
    // WARNING: should not use optional()/default(), all raw_input should be string(),
    // because controlled react component cannot receive undefined as value.
    title: z.string().min(1, "标题不允许为空").max(20, "标题不能超过20个字符"),
    kind: z.enum(["downloadable", "html", ""])
      .refine((k) => k !== "", "请选择游戏类型"),
      // .transform((k) => k || "downloadable"), // should not use transform
    
    uploadfile: ZipSchema,
    embed_op: z.enum(["embed_in_page", "fullscreen", ""]),
    // first define a placeholder, then for optional value just transform
    width: z.string().refine((z)=> z === "" || (/^\d+$/.test(z) && parseInt(z) > 0), "宽度必须为正整数"),
    height: z.string().refine((z)=> z === "" || (/^\d+$/.test(z)  && parseInt(z) > 0), "高度必须为正整数"),
    description: z.string(),
    tags: z.array(z.number()),
    // need name to show.
    developers: z
      .array(z.object({ id: z.number().int().nonnegative(), name: z.string() }))
      .min(1, "至少需要一个开发者"),
    cover: CoverSchema,
    screenshots: ScreenshotsSchema,
  })
  .refine((form) => {
    // post refine depends on multi field, must have width and height
    if (form.kind === "html") {
      return (
        form.embed_op &&
        (form.embed_op === "fullscreen" || (form.width && form.height))
      );
    }
  }, "HTML 嵌入必须指定窗口尺寸（可用引擎查看场景像素宽高），否则用全屏模式");


// cannot transform, no use.
// export type GameFormOutputType = z.output<typeof GameFormSchema>;

export type GameFormInputType = z.input<typeof GameFormSchema>;
