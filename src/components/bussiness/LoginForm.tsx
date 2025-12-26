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
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, setError } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/app/store";
import { toast } from 'sonner';
export default function LoginForm() {
  // 我们虽然使用ShadCn组件库 但form组件是基于react hook form的 这个还是很强大的 推荐你学习一下 用于处理表单提交
  const form = useForm<login_Values>({
    resolver: zodResolver(login_Schema),
    defaultValues: {
      account: "",
      password: "",
    },
    // 一定要给初始值 这是react hook form 的要求
  });
  const {setFocus,setValue,reset} = form;
  // 避免直接操作dom 尽量使用提供的函数
  const dispatch = useDispatch<AppDispatch>();
    const error = useSelector((state: RootState) => state.auth.error);
    useEffect(() => {
      if (error&&error!=="") {
        toast.error(typeof error === "string" ? error : "发生错误", {
          position: "top-center",
        });
        setValue("password","");
        dispatch(setError(""))
        // 在if里可以设置依赖值
      }
    }, [error]); 
    useEffect(()=>{
      setFocus("account")
    },[setFocus])
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    useEffect(()=>{
      if(isAuthenticated)
      {
        nav('/home')
      }
    },[isAuthenticated])
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();
  const { handleSubmit, register, control } = form;
  async function onSubmit(values: login_Values) {
    try {
      await dispatch(
        login({
          username: values.account,
          password: values.password,
        })
      ).unwrap();
      nav("/home");
    } catch (error) {
      
    }
  }
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
                    type={showPassword ? "text" : "password"}
                    placeholder="密码"
                    {...field}
                    className="h-11 rounded-lg pl-10 border-2 text-xl"
                  />
                  {showPassword ? (
                    <Button
                      type="button"
                      className="absolute top-1/2  right-2 -translate-y-1/2"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setShowPassword(false);
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
                        setShowPassword(true);
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
        <div className="flex items-center justify-between">
          <Button variant="link" asChild className="px-0 text-sm">
            <Link to="/signup">注册账号</Link>
          </Button>
          {/* aschild 相当于只把这个样式传递给儿子 而不实际生成对用的dom button本身不支持内部包裹a或link */}
          <Button variant="link" asChild className="px-0 text-sm">
            <Link to="/forget">忘记密码？</Link>
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          登录
        </Button>
      </form>
    </Form>
  );
}
