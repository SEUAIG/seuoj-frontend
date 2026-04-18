import { forget_Schema, forget_Values } from "@/types/forget_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
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
import { Mail, Lock, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api/axios";
import { toast } from "sonner";

export default function ForgetForm() {
  const navigate = useNavigate();
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<forget_Values>({
    resolver: zodResolver(forget_Schema),
    defaultValues: {
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, control, getValues } = form;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    const email = getValues("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("请输入正确的邮箱地址");
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/api/auth/reset-password/send-code", { email });
      const data = res.data;
      if (data.code === 0) {
        setVerificationId(data.data.verification_id);
        setCountdown(data.data.next_send_in || 60);
        toast.success("验证码已发送到您的邮箱");
      } else {
        toast.error(data.message || "发送失败");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "发送失败";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }, [getValues]);

  async function onSubmit(values: forget_Values) {
    if (!verificationId) {
      toast.error("请先发送验证码");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/auth/reset-password", {
        email: values.email,
        verification_id: verificationId,
        code: values.code,
        new_password: values.newPassword,
      });
      if (res.data.code === 0) {
        toast.success("密码重置成功，请使用新密码登录");
        navigate("/login");
      } else {
        toast.error(res.data.message || "重置失败");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "重置失败";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 my-6 w-2/5 mx-auto bg-white p-6 rounded shadow-xl border"
      >
        <h2 className="text-xl font-bold text-center">重置密码</h2>

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="请输入注册邮箱"
                    {...field}
                    className="h-11 rounded-lg pl-10 border-2"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="code"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>验证码</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute top-1/2 left-2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="6位验证码"
                      maxLength={6}
                      {...field}
                      className="h-11 rounded-lg pl-10 border-2"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-4 whitespace-nowrap"
                    disabled={sending || countdown > 0}
                    onClick={handleSendCode}
                  >
                    {sending
                      ? "发送中..."
                      : countdown > 0
                        ? `${countdown}s 后重发`
                        : "发送验证码"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="newPassword"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel>新密码</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="请输入新密码（6-20位）"
                    {...field}
                    className="h-11 rounded-lg pl-10 border-2"
                  />
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
                  <Lock className="absolute top-1/2 left-2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="再次输入新密码"
                    {...field}
                    className="h-11 rounded-lg pl-10 border-2"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {submitting ? "重置中..." : "重置密码"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          想起密码了？{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            返回登录
          </Link>
        </p>
      </form>
    </Form>
  );
}
