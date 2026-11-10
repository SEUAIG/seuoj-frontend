import z from "zod";
export const ACCOUNT_REGEX = /^[A-Za-z0-9_]+$/;
export const PASSWORD_REGEX =
  /^[A-Za-z0-9.,\/;'[\]\\\-=`~!@#$%^&*()_+{}:"<>?]+$/;
export const login_Schema = z.object({
  identifier: z.string().min(1, "请输入用户名或邮箱"),
  password: z
    .string()
    .min(6, "密码至少六位")
    .max(64, "密码长度不能超过六十四位"),
});
export type login_Values = z.infer<typeof login_Schema>
