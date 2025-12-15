import z from "zod";

export const forget_Schema = z.object({
email:z.string().email("错误的邮箱格式，请检查") 
});
export type forget_Values = z.infer<typeof forget_Schema>;
