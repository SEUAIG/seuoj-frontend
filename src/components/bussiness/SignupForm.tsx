import { signup_Schema, signup_Values } from "@/types/signup_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User,Mail ,Lock,Eye,EyeOff} from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "react-router-dom";
export default function SignupForm() {
  // 我们虽然使用ShadCn组件库 但form组件是基于react hook form的 这个还是很强大的 推荐你学习一下 用于处理表单提交
  const form = useForm<signup_Values>({
    resolver: zodResolver(signup_Schema),
    defaultValues: {
      account: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const { handleSubmit, register, control } = form;
  function onSubmit(values: signup_Values) {}
  return (
    <Form {...form}>
      {/* 上下文提供者 shadcn自带组件 展开useForm返回的对象 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6  w-2/5 mx-auto my-8 bg-white p-6 rounded shadow-xl border"
      >
        {/* 账号部分 */}
        {/* control 用于将这一部分接入RHF的管理 render将RHF提供的field传递 */}
        <FormField
          control={control}
          name="account"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute top-1/2  left-2 -translate-y-1/2" />
                  <Input
                    placeholder="用户名"
                    className="h-11 rounded-lg pl-10 border-2"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute top-1/2  left-2 -translate-y-1/2" />
                  <Input
                    placeholder="邮箱"
                    {...field}
                    className="h-11 rounded-lg pl-10 border-2"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 密码部分 */}
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>密码</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute top-1/2  left-2 -translate-y-1/2" />
                  <Input
                    type={showPassword1 ? "" : "password"}
                    placeholder="密码"
                    className="h-11 rounded-lg pl-10 border-2"
                    {...field}
                  />
                  {showPassword1 ? (
                    <Button
                      type="button"
                      className="absolute top-1/2  right-2 -translate-y-1/2"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowPassword1(false);
                      }}
                    >
                      {/* 注意这里 我为了让它只显示Icon 必须设置size 为 icon variant为ghost */}
                      {<Eye />}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="absolute top-1/2  right-2 -translate-y-1/2"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowPassword1(true);
                      }}
                    >
                      {/* 注意这里 我为了让它只显示Icon 必须设置size 为 icon variant为ghost */}
                      {<EyeOff />}
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute top-1/2  left-2 -translate-y-1/2" />
                  <Input
                    type={showPassword2 ? "" : "password"}
                    placeholder="确认密码"
                    className="h-11 rounded-lg pl-10 border-2"
                    {...field}
                  />
                  {showPassword2 ? (
                    <Button
                      type="button"
                      className="absolute top-1/2  right-2 -translate-y-1/2"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowPassword2(false);
                      }}
                    >
                      {/* 注意这里 我为了让它只显示Icon 必须设置size 为 icon variant为ghost */}
                      {<Eye />}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="absolute top-1/2  right-2 -translate-y-1/2"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowPassword2(true);
                      }}
                    >
                      {/* 注意这里 我为了让它只显示Icon 必须设置size 为 icon variant为ghost */}
                      {<EyeOff />}
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          注册
        </Button>
      </form>
    </Form>
  );
}
