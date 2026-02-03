import z from "zod";
export const ACCOUNT_REGEX = /^[A-Za-z0-9_]+$/;
export const PASSWORD_REGEX =
  /^[A-Za-z0-9.,\/;'[\]\\\-=`~!@#$%^&*()_+{}:"<>?]+$/;
export const signup_Schema = z.object({
  account: z
    .string()
    .min(6, "账号长度不能小于六位")
    .max(20, "账号长度不能大于二十位")
    .regex(ACCOUNT_REGEX, "账号仅支持大小写字母，数字与下划线"),
  password: z
    .string()
    .min(6, "密码至少六位")
    .max(20, "密码长度不能超过二十位")
    .regex(PASSWORD_REGEX, "密码只能包含字母、数字和常见英文符号"),
  email: z.string().email("错误的邮箱格式，请检查"),
  verificationCode:z.string().min(1,"请填写注册邮箱收到的验证码"),
  confirmPassword: z
    .string()
    .min(6, "密码至少六位")
    .max(20, "密码长度不能超过二十位")
    .regex(PASSWORD_REGEX, "密码只能包含字母、数字和常见英文符号"),
  verification_id:z.string().min(1,"验证会话ID丢失，请重新发送验证码")
}).refine((data)=>data.password===data.confirmPassword,{message:"两次输入的密码不一致",path:["confirmPassword"]});
// 我们采用zod校验 账号密码均在6-20位 注意账号密码均有格式要求 可参考报错信息
// refine 在整个object后面 来拿到整个表单对象 用于同时访问两次password path将错误信息挂载到某个输入框下
export type signup_Values = z.infer<typeof signup_Schema>;
