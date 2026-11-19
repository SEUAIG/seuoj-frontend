import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginCompleted } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";
import type { LoginData, MfaSetupData } from "@/models/auth";
import { mfaEnableRequest, mfaSetupRequest, mfaVerifyRequest } from "@/services/auth";

interface Props {
  step: "verify" | "setup";
  mfaToken: string;
  onCancel: () => void;
}

const errorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "请求失败";

const isExpired = (error: unknown) =>
  (error as { response?: { status?: number } })?.response?.status === 401;

export default function MfaLoginStep({ step, mfaToken, onCancel }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [setup, setSetup] = useState<MfaSetupData | null>(null);
  const [qr, setQr] = useState<string>("");
  const [finished, setFinished] = useState<LoginData | null>(null);

  const fail = (error: unknown) => {
    if (isExpired(error)) {
      toast.error("验证已超时，请重新登录", { position: "top-center" });
      onCancel();
      return;
    }
    toast.error(errorMessage(error), { position: "top-center" });
    setCode("");
  };

  useEffect(() => {
    if (step !== "setup") return;
    let cancelled = false;
    mfaSetupRequest(mfaToken)
      .then(async (res) => {
        if (cancelled) return;
        setSetup(res.data);
        setQr(await QRCode.toDataURL(res.data.otpauthUri, { margin: 1, width: 200 }));
      })
      .catch((error) => !cancelled && fail(error));
    return () => {
      cancelled = true;
    };
    // 只在进入绑定步骤时取一次密钥；再取会换新密钥，旧二维码作废
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mfaToken]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      if (step === "verify") {
        const res = await mfaVerifyRequest({ mfaToken, code });
        dispatch(loginCompleted(res.data));
      } else {
        const res = await mfaEnableRequest({ mfaToken, code });
        setFinished(res.data);
      }
    } catch (error) {
      fail(error);
    } finally {
      setSubmitting(false);
    }
  }

  if (finished) {
    const codes = finished.recoveryCodes ?? [];
    return (
      <div className="space-y-5 w-full">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">保存恢复码</h2>
          <p className="text-sm text-muted-foreground">
            手机丢失或换机时，每个恢复码可以代替一次动态码。恢复码只显示这一次，请保存到密码管理器等安全的地方。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4 font-mono text-sm">
          {codes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() =>
              navigator.clipboard
                .writeText(codes.join("\n"))
                .then(() => toast.success("已复制", { position: "top-center" }))
                .catch(() => toast.error("复制失败，请手动抄写", { position: "top-center" }))
            }
          >
            复制
          </Button>
          <Button type="button" className="flex-1" onClick={() => dispatch(loginCompleted(finished))}>
            我已保存，进入网站
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 w-full">
      {step === "verify" ? (
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">两步验证</h2>
          <p className="text-sm text-muted-foreground">
            输入验证器 App 里 SEUOJ 的 6 位动态码。手机不在身边时可以输入恢复码。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">绑定验证器</h2>
            <p className="text-sm text-muted-foreground">
              超级管理员账号必须开启两步验证。用 Google Authenticator、Microsoft Authenticator 等 App 扫描二维码：
            </p>
          </div>
          <div className="flex justify-center">
            {qr ? (
              <img src={qr} alt="验证器二维码" width={200} height={200} className="rounded-md border" />
            ) : (
              <div className="h-[200px] w-[200px] rounded-md border bg-muted/40" />
            )}
          </div>
          {setup && (
            <p className="text-sm text-muted-foreground">
              无法扫码时手动输入密钥：
              <span className="mt-1 block break-all font-mono text-foreground">
                {setup.secret.match(/.{1,4}/g)?.join(" ")}
              </span>
            </p>
          )}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="mfa-code">{step === "verify" ? "动态码或恢复码" : "App 上显示的 6 位动态码"}</Label>
        <Input
          id="mfa-code"
          autoFocus
          autoComplete="one-time-code"
          inputMode={step === "setup" ? "numeric" : "text"}
          maxLength={32}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-12 rounded-lg font-mono tracking-widest"
        />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="h-12 flex-1" onClick={onCancel}>
          返回
        </Button>
        <Button
          type="submit"
          disabled={submitting || !code.trim() || (step === "setup" && !setup)}
          className="h-12 flex-1"
        >
          {step === "verify" ? "验证" : "绑定并登录"}
        </Button>
      </div>
    </form>
  );
}
