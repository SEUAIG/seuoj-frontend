import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { setCurrentProfile } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { changePassword } from "@/services/auth";
import { getSettings, saveSettings, savePermissions, sendEmailCode, changeEmail, resetUserPassword, type UserSettings } from "@/services/user/settings";
import { capabilityLabels, effectiveCapabilities, type Capability } from "@/lib/capabilities";

const descriptions: Record<Capability, string> = {
  PROBLEM_CREATE: "创建题目、导入题目包，并编辑自己创建的题目。",
  PROBLEM_MANAGE: "查看、编辑所有题目及完整测试数据。",
  CONTEST_CREATE: "创建比赛，并管理自己创建的比赛。",
  CONTEST_MANAGE: "查看和编辑所有比赛，查看完整提交详情；提交不计入比赛榜单。",
  USER_MANAGE: "查询、导入和维护普通账号资料，设置是否允许修改昵称。",
  TEACHER: "使用教学功能，自动包含题目创建与导入、比赛创建。",
  ACCOUNT_ADMIN: "自动包含以上全部权限，并可分配账号权限。",
};

export default function ProfileEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const [params, setParams] = useSearchParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [allowNickname, setAllowNickname] = useState(true);
  const [assigned, setAssigned] = useState<Capability[]>([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [code, setCode] = useState("");
  const [verification, setVerification] = useState<{ id: string; email: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState<string | null>(null);
  const isSelf = !userId || String(settings?.id) === currentUser?.id;
  const canReset = !isSelf && !!settings?.canManageProfile;
  const tab = params.get("tab") === "permissions" ? "permissions" : params.get("tab") === "security" && (isSelf || canReset) ? "security" : "profile";

  useEffect(() => {
    let cancelled = false;
    setSettings(null); setError("");
    setOldPassword(""); setNewPassword(""); setConfirmation(""); setEmailPassword(""); setCode(""); setVerification(null); setResetPassword(null);
    getSettings(userId).then(value => {
      if (cancelled) return;
      setSettings(value); setNickname(value.nickname || ""); setEmail(value.email);
      setAllowNickname(value.allowNicknameChange); setAssigned(value.assigned);
    }).catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : "加载失败"); });
    return () => { cancelled = true; };
  }, [userId]);
  useEffect(() => {
    if (!cooldown) return;
    const id = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const accept = (value: UserSettings) => {
    setSettings(value); setNickname(value.nickname || ""); setEmail(value.email);
    setAllowNickname(value.allowNicknameChange); setAssigned(value.assigned);
    if (isSelf) dispatch(setCurrentProfile({ ...value, capabilities: value.effective }));
  };
  const act = async (operation: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try { await operation(); } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "操作失败，请重试"); }
    finally { setBusy(false); }
  };
  const profileSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    void act(async () => {
      accept(await saveSettings(settings.id, { nickname: nickname.trim(), ...(!isSelf ? { email: email.trim(), allowNicknameChange: allowNickname } : {}) }));
      toast.success("资料已保存");
    });
  };
  const passwordSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmation) return toast.error("两次输入的新密码不一致");
    void act(async () => {
      const response = await changePassword({ old_password: oldPassword, new_password: newPassword });
      if (response.code !== 0) throw new Error(response.message || "修改失败");
      setOldPassword(""); setNewPassword(""); setConfirmation(""); toast.success("密码已修改");
    });
  };
  const emailSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!verification || verification.email !== email.trim()) return toast.error("请先获取新邮箱验证码");
    void act(async () => {
      accept(await changeEmail({ email: email.trim(), password: emailPassword, verificationId: verification.id, code }));
      setEmailPassword(""); setCode(""); setVerification(null); toast.success("邮箱已修改");
    });
  };
  const resetSubmit = () => {
    if (!settings) return;
    void act(async () => {
      const result = await resetUserPassword(settings.id);
      setResetPassword(result.password); toast.success("密码已重设");
    });
  };
  const copyResetPassword = async () => {
    if (!resetPassword) return;
    try { await navigator.clipboard.writeText(resetPassword); toast.success("已复制新密码"); }
    catch { toast.error("复制失败，请手动选中复制"); }
  };
  if (userId && settings && String(settings.id) === currentUser?.id) return <Navigate to="/personal/edit" replace />;
  const effective = effectiveCapabilities(assigned);
  const profileChanged = settings && (nickname.trim() !== (settings.nickname || "") || (!isSelf && (email.trim() !== settings.email || allowNickname !== settings.allowNicknameChange)));
  const permissionsChanged = settings && [...assigned].sort().join() !== [...settings.assigned].sort().join();
  const canEditNickname = !isSelf || settings?.allowNicknameChange;
  return <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
    <Helmet><title>编辑资料 - SEUOJ</title></Helmet>
    <Link to={isSelf ? "/personal" : `/user/${userId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />返回主页</Link>
    <h1 className="text-2xl font-semibold">编辑资料</h1>
    {settings && <p className="mt-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">@{settings.username}</p>}
    {error ? <p role="alert" className="py-10 text-destructive">{error}</p> : !settings ? <div className="flex items-center gap-2 py-10"><Loader2 className="h-4 w-4 animate-spin" />加载资料…</div> :
      <Tabs value={tab} onValueChange={value => {
        setOldPassword(""); setNewPassword(""); setConfirmation(""); setEmailPassword(""); setCode(""); setResetPassword(null);
        setParams(value === "profile" ? {} : { tab: value }, { replace: true });
      }} className="mt-8">
        <TabsList className="h-auto w-full justify-start gap-1 border-b bg-transparent p-0 pb-2">
          <TabsTrigger value="profile" disabled={busy}>基本资料</TabsTrigger>
          {(isSelf || canReset) && <TabsTrigger value="security" disabled={busy}>账号安全</TabsTrigger>}
          <TabsTrigger value="permissions" disabled={busy}>权限</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="pt-6">
          <form onSubmit={profileSubmit} className="space-y-6">
            <div className="space-y-2"><label htmlFor="username">用户名</label><Input id="username" value={settings.username} readOnly className="bg-muted/40" /></div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="nickname">昵称</label>
                <label className="flex items-center gap-2 text-sm" htmlFor="nickname-allowed">允许本人修改昵称<Switch id="nickname-allowed" checked={allowNickname} onCheckedChange={setAllowNickname} disabled={busy || !settings.canManageProfile} /></label>
              </div>
              <Input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={64} disabled={busy || !canEditNickname} autoComplete="nickname" />
              <p className="text-sm text-muted-foreground">{canEditNickname ? "显示在用户主页和提交记录中，留空使用用户名。" : "此账号的昵称由管理员维护。"}</p>
            </div>
            <div className="space-y-2"><label htmlFor="profile-email">邮箱</label><Input id="profile-email" type="email" value={isSelf ? settings.email : email} onChange={e => setEmail(e.target.value)} readOnly={isSelf} disabled={busy} required maxLength={128} />
              {isSelf && <Button type="button" variant="link" className="h-auto p-0" onClick={() => setParams({ tab: "security" })}>修改邮箱</Button>}
            </div>
            <Button disabled={busy || !profileChanged} type="submit">{busy ? "保存中…" : "保存资料"}</Button>
          </form>
        </TabsContent>
        {isSelf && <TabsContent value="security" className="space-y-10 pt-6">
          <section><h2 className="text-lg font-medium">修改密码</h2><form onSubmit={passwordSubmit} className="mt-5 space-y-4">
            <input name="username" value={settings.username} autoComplete="username" readOnly hidden />
            <label className="block space-y-2"><span>当前密码</span><Input type="password" autoComplete="current-password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} disabled={busy} required /></label>
            <label className="block space-y-2"><span>新密码（6–20 位）</span><Input type="password" autoComplete="new-password" minLength={6} maxLength={20} value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={busy} required /></label>
            <label className="block space-y-2"><span>确认新密码</span><Input type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} required /></label>
            <Button disabled={busy} type="submit">修改密码</Button>
          </form></section>
          <section className="border-t pt-8"><h2 className="text-lg font-medium">修改邮箱</h2><p className="mt-2 text-sm text-muted-foreground">验证当前密码和新邮箱后生效。</p>
            <form onSubmit={emailSubmit} className="mt-5 space-y-4">
              <label className="block space-y-2"><span>新邮箱</span><Input type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setVerification(null); setCode(""); }} disabled={busy} required maxLength={128} /></label>
              <Button type="button" variant="outline" disabled={busy || cooldown > 0 || !email.trim() || email.trim() === settings.email} onClick={() => void act(async () => {
                const sent = await sendEmailCode(email.trim()); setVerification({ id: sent.verification_id, email: email.trim() }); setCooldown(sent.next_send_in); toast.success("验证码已发送");
              })}>{cooldown ? `${cooldown} 秒后可重新发送` : "发送验证码"}</Button>
              <label className="block space-y-2"><span>邮箱验证码</span><Input value={code} onChange={e => setCode(e.target.value)} autoComplete="one-time-code" disabled={busy} required /></label>
              <label className="block space-y-2"><span>当前密码</span><Input type="password" autoComplete="current-password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} disabled={busy} required /></label>
              <Button type="submit" disabled={busy || !verification}>修改邮箱</Button>
            </form>
          </section>
        </TabsContent>}
        {canReset && <TabsContent value="security" className="pt-6">
          <section><h2 className="text-lg font-medium">重设密码</h2>
            <p className="mt-2 text-sm text-muted-foreground">为该账号生成 12 位随机新密码，原密码立即失效。新密码只显示这一次，请转告本人并提醒其登录后自行修改。</p>
            {resetPassword && <div className="mt-5 space-y-2">
              <label htmlFor="reset-password" className="block">新密码</label>
              <div className="flex gap-2"><Input id="reset-password" value={resetPassword} readOnly className="font-mono" onFocus={e => e.currentTarget.select()} /><Button type="button" variant="outline" onClick={() => void copyResetPassword()}>复制</Button></div>
              <p className="text-sm text-muted-foreground">离开本页后无法再次查看。</p>
            </div>}
            <Button type="button" variant="destructive" className="mt-5" disabled={busy} onClick={() => setResetOpen(true)}>{resetPassword ? "再次重设" : "重设密码"}</Button>
          </section>
          <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认重设密码</AlertDialogTitle>
                <AlertDialogDescription className="[overflow-wrap:anywhere]">将为 @{settings.username} 生成新密码，原密码立即失效。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={resetSubmit}>重设</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>}
        <TabsContent value="permissions" className="pt-6">
          <p className="mb-4 text-sm text-muted-foreground">{settings.canManagePermissions ? "调整后点击保存权限生效。" : "以下为账号现有权限，由账号管理员分配。"}</p>
          <div className="divide-y">{(Object.keys(capabilityLabels) as Capability[]).map(capability => {
            const inherited = !assigned.includes(capability) && effective.includes(capability);
            const lockedByRole = capability !== "ACCOUNT_ADMIN" && assigned.includes("ACCOUNT_ADMIN") || ["PROBLEM_CREATE", "CONTEST_CREATE"].includes(capability) && assigned.includes("TEACHER");
            return <div key={capability} className="flex items-start justify-between gap-4 py-4">
              <div><label htmlFor={`cap-${capability}`} className="font-medium">{capabilityLabels[capability]}</label><p className="mt-1 text-sm text-muted-foreground">{descriptions[capability]}</p>{(inherited || lockedByRole) && <p className="mt-1 text-xs text-muted-foreground">由{assigned.includes("ACCOUNT_ADMIN") ? "账号管理员" : "教师权限"}自动包含</p>}</div>
              <Switch id={`cap-${capability}`} className="mt-1 shrink-0" checked={effective.includes(capability)} disabled={busy || !settings.canManagePermissions || lockedByRole || capability === "ACCOUNT_ADMIN" && !settings.canGrantAdmin} onCheckedChange={checked => setAssigned(previous => checked ? [...previous, capability] : previous.filter(c => c !== capability))} />
            </div>;
          })}</div>
          {settings.canManagePermissions && <Button className="mt-5" disabled={busy || !permissionsChanged} onClick={() => void act(async () => { accept(await savePermissions(settings.id, assigned)); toast.success("权限已保存"); })}>保存权限</Button>}
          <p className="mt-8 border-t pt-5 text-sm text-muted-foreground">单个班级、题目或比赛的授权在对应管理页面设置。创建者对自己创建的资源仍有编辑权限。</p>
        </TabsContent>
      </Tabs>}
  </div>;
}
