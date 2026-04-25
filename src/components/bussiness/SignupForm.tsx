import { signup_Schema, signup_Values } from "@/types/signup_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/store";
import { setError, signup } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { RootState } from "../../app/store";
import getVerificationCode from "@/services/getVerificationCode";
import { getVerificationCodeBythunk } from "@/features/verification/verificationSlice";
export default function SignupForm() {
  // 我们虽然使用ShadCn组件库 但form组件是基于react hook form的 这个还是很强大的 推荐你学习一下 用于处理表单提交
  const form = useForm<signup_Values>({
    resolver: zodResolver(signup_Schema),
    defaultValues: {
      account: "",
      email: "",
      verificationCode: "",
      verification_id: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const error = useSelector((state: RootState) => state.auth.error);
  const {
    sendStatus,
    expireAt,
    nextSendAt,
    error: verificationError,
    verificationID,
  } = useSelector((state: RootState) => state.verification);
  const { setFocus, setValue, reset, watch } = form;
  const verificationCode = watch("verificationCode");
  const [expireLeft, setExpireLeft] = useState<number>(0);
  const [resendLeft, setResendLeft] = useState<number>(0);
  useEffect(() => {
    if (error && error !== "") {
      toast.error(typeof error === "string" ? error : "发生错误", {
        position: "top-center",
      });
      reset();
      dispatch(setError(""));
    }
  }, [error, reset, dispatch]);
  useEffect(() => {
    setFocus("account");
  }, [setFocus]);
  useEffect(() => {
    if (!expireAt && !nextSendAt) {
      setExpireLeft(0);
      setResendLeft(0);
      return;
    }
    const timer = setInterval(() => {
      const now = Date.now();
      setExpireLeft(
        expireAt ? Math.max(0, Math.ceil((expireAt - now) / 1000)) : 0
      );
      setResendLeft(
        nextSendAt ? Math.max(0, Math.ceil((nextSendAt - now) / 1000)) : 0
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [expireAt, nextSendAt]);
  useEffect(() => {
    if (verificationID) {
      setValue("verification_id", verificationID);
    }
  }, [verificationID, setValue]);
  const { handleSubmit, register, control, trigger, setError: seterror } = form;
  const email = watch("email");
  async function onSubmit(values: signup_Values) {
    try {
      await dispatch(
        signup({
          username: values.account,
          password: values.password,
          email: values.email,
          verification_id: values.verification_id,
          code: values.verificationCode,
        })
      ).unwrap();
      // 这是一个异步操作 需要等这一步完成后 再考虑执行下一步还是catch 转化为类同步 有await 就需要加上async 执行前要加await
      nav("/login");
    } catch (err) {
      if (typeof err === "string") {
        dispatch(setError(err));
      } else if (err instanceof Error) {
        dispatch(setError(err.message));
      } else {
        dispatch(setError("注册发生未知错误，请联系管理员解决"));
      }
    }
  }
  return (
    <Form {...form}>
      {/* 上下文提供者 shadcn自带组件 展开useForm返回的对象 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
        {/* 账号部分 */}
        {/* control 用于将这一部分接入RHF的管理 render将RHF提供的field传递 */}
        <FormField
          control={control}
          name="account"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-gray-700 font-medium">
                用户名
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <User
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    size={20}
                  />
                  <Input
                    placeholder="请输入用户名"
                    className="h-12 rounded-lg pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
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
              <FormLabel className="text-gray-700 font-medium">邮箱</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 group">
                    <Mail
                      className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                      size={20}
                    />
                    <Input
                      placeholder="请输入邮箱"
                      {...field}
                      className="h-12 rounded-lg pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-[120px] shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
                    disabled={sendStatus === "loading" || resendLeft > 0}
                    onClick={async () => {
                      // @ts-ignore: 暂时忽略 Zod v4 + RHF 类型推断导致的参数错误
                      const isValid = await (trigger as any)("email");
                      if (!isValid) {
                        return;
                      }
                      try {
                        await dispatch(
                          getVerificationCodeBythunk({ email })
                        ).unwrap();
                        // await 应该在最外层
                        toast.success("验证码已发送");
                      } catch (err) {
                        toast.error(err as string);
                      }
                    }}
                  >
                    {resendLeft > 0 ? `重发(${resendLeft}s)` : "发送验证码"}
                  </Button>
                </div>
              </FormControl>
              <div className="text-xs text-slate-500">
                {expireLeft > 0
                  ? `验证码有效期剩余 ${expireLeft}s`
                  : "验证码未发送或已过期"}
              </div>
              {sendStatus === "error" && verificationError ? (
                <div className="text-xs text-red-500">{verificationError}</div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-gray-700 font-medium">
                验证码
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <KeyRound
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    size={20}
                  />
                  <Input
                    placeholder="请输入验证码"
                    {...field}
                    className="h-12 rounded-lg pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white tracking-widest"
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
                  <Lock
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    size={20}
                  />
                  <Input
                    type={showPassword1 ? "text" : "password"}
                    placeholder="请输入密码"
                    className="h-12 rounded-lg pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-lg tracking-wider"
                    {...field}
                  />
                  {showPassword1 ? (
                    <Button
                      type="button"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowPassword1(false)}
                    >
                      <Eye size={20} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowPassword1(true)}
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
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-gray-700 font-medium">
                确认密码
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    size={20}
                  />
                  <Input
                    type={showPassword2 ? "text" : "password"}
                    placeholder="请再次输入密码"
                    className="h-12 rounded-lg pl-10 pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-lg tracking-wider"
                    {...field}
                  />
                  {showPassword2 ? (
                    <Button
                      type="button"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowPassword2(false)}
                    >
                      <Eye size={20} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowPassword2(true)}
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
        <Button
          type="submit"
          className="w-full h-12 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          注册
        </Button>
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
          >
            已有账号？返回登录
          </Link>
        </div>
      </form>
    </Form>
  );
}
