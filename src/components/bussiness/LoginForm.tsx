import { login_Schema, login_Values } from "@/types/login_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { User, Lock, Eye, EyeOff, EqualApproximatelyIcon, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, setError } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/app/store";
import { toast } from "sonner";
export default function LoginForm() {
  // 我们虽然使用ShadCn组件库 但form组件是基于react hook form的 这个还是很强大的 推荐你学习一下 用于处理表单提交
  const form = useForm<login_Values>({
    resolver: zodResolver(login_Schema),
    defaultValues: {
      email: "",
      password: "",
    },
    // 一定要给初始值 这是react hook form 的要求
  });
  const { setFocus, setValue, reset } = form;
  // 避免直接操作dom 尽量使用提供的函数
  const dispatch = useDispatch<AppDispatch>();
  const error = useSelector((state: RootState) => state.auth.error);
  useEffect(() => {
    if (error && error !== "") {
      toast.error(typeof error === "string" ? error : "发生错误", {
        position: "top-center",
      });
      setValue("password", "");
      dispatch(setError(""));
      // 在if里可以设置依赖值
    }
  }, [error]);
  useEffect(() => {
    setFocus("email");
  }, [setFocus]);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if (isAuthenticated) {
      nav("/home");
    }
  }, [isAuthenticated]);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();
  const { handleSubmit, register, control } = form;
  async function onSubmit(values: login_Values) {
    try {
      await dispatch(
        login({
          email: values.email,
          password: values.password,
        })
      ).unwrap();
      nav("/home");
    } catch (error) {}
  }
  return (
    <Form {...form}>
      {/* 上下文提供者 shadcn自带组件 展开useForm返回的对象 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full"
      >
        {/* 账号部分 */}
        {/* control 用于将这一部分接入RHF的管理 render将RHF提供的field传递 */}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-gray-700 font-medium">邮箱</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <Input
                    placeholder="请输入您的邮箱"
                    {...field}
                    className="h-12 rounded-lg pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
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
              <FormLabel className="text-gray-700 font-medium">密码</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    {...field}
                    className="h-12 rounded-lg pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-lg tracking-wider"
                  />
                  {showPassword ? (
                    <Button
                      type="button"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowPassword(false)}
                    >
                      <Eye size={20} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowPassword(true)}
                    >
                      <EyeOff size={20} />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between pt-2">
          <Button variant="link" asChild className="px-0 text-sm text-gray-500 hover:text-indigo-600 font-normal">
            <Link to="/signup">注册账号</Link>
          </Button>
          <Button variant="link" asChild className="px-0 text-sm text-gray-500 hover:text-indigo-600 font-normal">
            <Link to="/forget">忘记密码？</Link>
          </Button>
        </div>
        <Button
          type="submit"
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          登录
        </Button>
      </form>
    </Form>
  );
}
