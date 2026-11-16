import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { banUsers, unbanUsers } from "@/services/user/banUsers";

export interface BanTargetUser {
    user_id: number;
    username: string;
    nickname?: string | null;
}

export type BanDialogMode = "ban" | "unban";

const DURATIONS = [
    { key: "1d", label: "1 天", days: 1 },
    { key: "7d", label: "7 天", days: 7 },
    { key: "30d", label: "30 天", days: 30 },
    { key: "forever", label: "永久", days: null },
    { key: "custom", label: "指定时间", days: null },
] as const;
type DurationKey = (typeof DURATIONS)[number]["key"];

const MAX_BATCH = 500;

function pad(n: number) {
    return String(n).padStart(2, "0");
}

/** 后端按本地时间（东八区）解析，这里也按浏览器本地时间拼，不带时区 */
function toLocalDateTime(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function parseUsernames(text: string) {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const raw of text.split(/[\s,，;；]+/)) {
        const name = raw.trim();
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());
        names.push(name);
    }
    return names;
}

interface Props {
    open: boolean;
    mode: BanDialogMode;
    /** 列表里勾选的账号；为空时只能按账号名输入 */
    users: BanTargetUser[];
    /** 允许粘贴账号名（管理页顶部入口） */
    allowUsernames?: boolean;
    onOpenChange: (open: boolean) => void;
    onDone: () => void;
}

export default function UserBanDialog({ open, mode, users, allowUsernames, onOpenChange, onDone }: Props) {
    const [reason, setReason] = useState("");
    const [duration, setDuration] = useState<DurationKey>("7d");
    const [customUntil, setCustomUntil] = useState("");
    const [usernameText, setUsernameText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setReason("");
            setDuration("7d");
            setCustomUntil("");
            setUsernameText("");
        }
    }, [open]);

    const usernames = useMemo(() => (allowUsernames ? parseUsernames(usernameText) : []), [allowUsernames, usernameText]);
    const total = users.length + usernames.length;
    const verb = mode === "ban" ? "封禁" : "解封";

    const resolveUntil = (): string | null | undefined => {
        if (duration === "forever") return null;
        if (duration === "custom") {
            if (!customUntil) return undefined;
            const date = new Date(customUntil);
            if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return undefined;
            return toLocalDateTime(date);
        }
        const days = DURATIONS.find((d) => d.key === duration)?.days ?? 1;
        return toLocalDateTime(new Date(Date.now() + days * 24 * 3600 * 1000));
    };

    const submit = async () => {
        if (total === 0) {
            toast.error(allowUsernames ? "请输入账号名" : "请先勾选账号");
            return;
        }
        if (total > MAX_BATCH) {
            toast.error(`一次最多${verb} ${MAX_BATCH} 个账号`);
            return;
        }
        const targets = {
            userIds: users.map((u) => u.user_id),
            usernames,
        };
        setSubmitting(true);
        try {
            if (mode === "ban") {
                if (!reason.trim()) {
                    toast.error("请填写封禁原因");
                    return;
                }
                const until = resolveUntil();
                if (until === undefined) {
                    toast.error("请选择晚于现在的解封时间");
                    return;
                }
                const result = await banUsers({ ...targets, reason: reason.trim(), until });
                toast.success(`已封禁 ${result.count} 个账号`);
            } else {
                const result = await unbanUsers(targets);
                toast.success(`已解封 ${result.count} 个账号`);
            }
            onOpenChange(false);
            onDone();
        } catch (err: unknown) {
            toast.error(`${verb}失败：` + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{verb}账号</DialogTitle>
                    <DialogDescription>
                        {mode === "ban"
                            ? "被封禁的账号立即退出登录，到期前无法登录；登录时会看到封禁原因和解封时间。"
                            : "解封后账号可以立即重新登录。"}
                        有任何一个账号不符合条件时，整批都不会生效。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {users.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">已选 {users.length} 个账号</p>
                            <div className="max-h-28 overflow-auto rounded-md border bg-muted/30 px-3 py-2 text-sm leading-6">
                                {users.map((u) => (
                                    <span key={u.user_id} className="mr-3 inline-block">
                                        {u.username}
                                        {u.nickname ? <span className="text-muted-foreground">（{u.nickname}）</span> : null}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {allowUsernames && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium" htmlFor="ban-usernames">账号名</label>
                            <Textarea
                                id="ban-usernames"
                                value={usernameText}
                                onChange={(e) => setUsernameText(e.target.value)}
                                placeholder={"每行一个，也可用空格或逗号分隔，例如：\n213240001\n213240002"}
                                className="min-h-28 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                识别到 {usernames.length} 个账号名
                                {mode === "ban" && "。其中已在封禁中的账号，原期限会被本次设置覆盖（永久封禁也会改成本次期限）"}
                            </p>
                        </div>
                    )}

                    {mode === "ban" && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium" htmlFor="ban-reason">原因</label>
                                <Input
                                    id="ban-reason"
                                    value={reason}
                                    maxLength={200}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="会显示给被封禁的用户，例如：比赛中代码抄袭"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-sm font-medium">时长</p>
                                <div className="flex flex-wrap gap-2">
                                    {DURATIONS.map((d) => (
                                        <Button
                                            key={d.key}
                                            type="button"
                                            size="sm"
                                            variant={duration === d.key ? "default" : "outline"}
                                            onClick={() => setDuration(d.key)}
                                        >
                                            {d.label}
                                        </Button>
                                    ))}
                                </div>
                                {duration === "custom" && (
                                    <Input
                                        type="datetime-local"
                                        value={customUntil}
                                        onChange={(e) => setCustomUntil(e.target.value)}
                                        className="max-w-60"
                                        aria-label="解封时间"
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        取消
                    </Button>
                    <Button
                        variant={mode === "ban" ? "destructive" : "default"}
                        onClick={submit}
                        disabled={submitting || total === 0}
                    >
                        {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                        {verb} {total > 0 ? `${total} 个账号` : ""}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
