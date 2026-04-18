import z from "zod";

export const forget_Schema = z.object({
    email: z.string().email("错误的邮箱格式，请检查"),
    code: z.string().min(6, "请输入6位验证码").max(6, "验证码为6位"),
    newPassword: z.string().min(6, "密码至少6位").max(20, "密码最长20位"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
});

export type forget_Values = z.infer<typeof forget_Schema>;
