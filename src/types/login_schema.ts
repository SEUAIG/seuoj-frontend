import z from "zod";
export const ACCOUNT_REGEX = /^[A-Za-z0-9_]+$/;
export const PASSWORD_REGEX =
  /^[A-Za-z0-9.,\/;'[\]\\\-=`~!@#$%^&*()_+{}:"<>?]+$/;
export const login_Schema = z.object({
  account: z
    .string()
    .min(6, "账号长度不能小于六位")
    .max(20, "账号长度不能大于二十位")
    .regex(ACCOUNT_REGEX, "账号仅支持大小写字母，数字与下划线"),
  password: z
    .string()
    .min(6, "密码至少六位")
    .max(20,"密码长度不能超过二十位")
    .regex(PASSWORD_REGEX, "密码只能包含字母、数字和常见英文符号"),
});
// 我们采用zod校验 账号密码均在6-20位 注意账号密码均有格式要求 可参考报错信息

export type login_Values = z.infer<typeof login_Schema> 