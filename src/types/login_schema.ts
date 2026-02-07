import z from "zod";
export const ACCOUNT_REGEX = /^[A-Za-z0-9_]+$/;
export const PASSWORD_REGEX =
  /^[A-Za-z0-9.,\/;'[\]\\\-=`~!@#$%^&*()_+{}:"<>?]+$/;
export const login_Schema = z.object({
  email: z.string().email("错误的邮箱格式，请检查"),
  password: z
    .string()
    .min(6, "密码至少六位")
    .max(20,"密码长度不能超过二十位")
    .regex(PASSWORD_REGEX, "密码只能包含字母、数字和常见英文符号"),
});
// 我们采用zod校验 账号密码均在6-20位 注意账号密码均有格式要求 可参考报错信息
export type login_Values = z.infer<typeof login_Schema> 