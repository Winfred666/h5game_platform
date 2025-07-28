import { z } from "zod";

// zod schema protect on server side.
//zparams means schema for search params.

export const IntSchema = z.coerce.number().int().nonnegative();
export const StringSchema = z.string().min(1, "输入词不能为空");
export const BooleanSchema = z.coerce.boolean().default(false);

export const PasswordSchema = z
  .string({ required_error: "密码不能为空" })
  .min(8, "密码长度不能少于8个字符")
  .max(64, "密码长度不能超过64个字符")
  .refine((p) => (/[a-z]/.test(p) || /[A-Z]/.test(p)) && /\d/.test(p), {
    message: "密码必须至少包含字母和数字",
  });

export const QQSchema = z
  .string({
    required_error: "QQ号不能为空",
  })
  .refine((val) => val.length >= 5 && val.length <= 12, {
    message: "QQ号长度应为5到12位",
  })
  .refine((val) => /^[0-9]\d*$/.test(val), {
    message: "QQ号必须以1-9开头且为纯数字",
  });

export const UserSessionSchema = z.object(
  {
    id: IntSchema,
    name: z.string(),
    isAdmin: z.coerce.boolean(),
  },
  {
    required_error: "用户会话信息不能为空",
    invalid_type_error: "用户会话信息格式不正确",
  }
);
