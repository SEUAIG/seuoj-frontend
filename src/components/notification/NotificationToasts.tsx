import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Megaphone, MessageCircleQuestion, MessageSquareReply, X } from "lucide-react";
import type { RootState } from "@/app/store";
import type { SiteNotification } from "@/models/notification";
import { claimNotifications, getPendingNotifications } from "@/services/Notification/notifications";
import { cn } from "@/lib/utils";

/** 同时最多显示几条 */
const VISIBLE = 3;
/** 多久问一次服务器；每条显示多久由 tailwind 的 notice-progress 动画决定（6 秒） */
const POLL_MS = 30_000;
/** 收起动画时长 */
const LEAVE_MS = 200;

interface Shown {
  n: SiteNotification;
  leaving: boolean;
}

function describe(n: SiteNotification) {
  const contest = n.contest_title ?? "比赛";
  const base = `/contest/${n.contest_id}/clarifications`;
  switch (n.type) {
    case "CONTEST_ANNOUNCEMENT":
      return { icon: Megaphone, title: contest, text: "有一条新公告", to: `${base}#announcement-${n.ref_id}` };
    case "CONTEST_ANNOUNCEMENT_UPDATED":
      return { icon: Megaphone, title: contest, text: "有一条公告更新了", to: `${base}#announcement-${n.ref_id}` };
    case "CLARIFICATION_ANSWERED":
      return { icon: MessageSquareReply, title: contest, text: "你的提问有了回复", to: `${base}#clarification-${n.ref_id}` };
    case "CLARIFICATION_ANSWER_UPDATED":
      return { icon: MessageSquareReply, title: contest, text: "你的提问的回复更新了", to: `${base}#clarification-${n.ref_id}` };
    case "CLARIFICATION_PUBLIC":
      return { icon: MessageSquareReply, title: contest, text: "有一条新的公开答疑", to: `${base}#clarification-${n.ref_id}` };
    case "CLARIFICATION_ASKED":
      return { icon: MessageCircleQuestion, title: contest, text: "有一条新提问", to: `${base}#clarification-${n.ref_id}` };
    default:
      return { icon: Megaphone, title: contest, text: "有新消息", to: base };
  }
}

/** 右上角弹窗：登录后才有；换账号时整个重来 */
export default function NotificationToasts() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated || !user) return null;
  return <ToastStack key={String(user.id ?? user.username)} />;
}

function ToastStack() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [shown, setShown] = useState<Shown[]>([]);
  const [remaining, setRemaining] = useState(0);

  const shownRef = useRef<Shown[]>([]);
  shownRef.current = shown;
  /** 从服务器拿到、还没 claim 的通知，按时间先后 */
  const queue = useRef<SiteNotification[]>([]);
  /** claim 过（不管抢没抢到）的 ID，重新拉列表时跳过 */
  const attempted = useRef(new Set<number>());
  /** 服务器上还有多少条没弹（不含已经 claim 过的） */
  const left = useRef(0);
  const filling = useRef(false);
  const fetching = useRef(false);
  const alive = useRef(true);

  const fill = useCallback(async () => {
    if (filling.current) return;
    filling.current = true;
    try {
      for (;;) {
        const free = VISIBLE - shownRef.current.filter((s) => !s.leaving).length;
        if (free <= 0 || queue.current.length === 0) break;
        const batch = queue.current.splice(0, free);
        let claimed: number[];
        try {
          claimed = await claimNotifications(batch.map((n) => n.id));
        } catch {
          queue.current.unshift(...batch); // 网络问题：放回去，下次轮询再试
          break;
        }
        if (!alive.current) return;
        batch.forEach((n) => attempted.current.add(n.id));
        left.current = Math.max(0, left.current - batch.length);
        setRemaining(left.current);
        const got = batch.filter((n) => claimed.includes(n.id));
        if (got.length) {
          const next = [...shownRef.current, ...got.map((n) => ({ n, leaving: false }))];
          shownRef.current = next;
          setShown(next);
          // 正开着这场比赛的页面时，让公告/答疑和红点马上刷新
          new Set(got.map((n) => n.contest_id)).forEach((cid) => {
            if (cid != null) qc.invalidateQueries({ queryKey: ["contestNotices", cid] });
          });
        }
      }
    } finally {
      filling.current = false;
    }
    // 这一页弹完了，服务器上还有积压：再拉一页
    const free = VISIBLE - shownRef.current.filter((s) => !s.leaving).length;
    if (alive.current && free > 0 && queue.current.length === 0 && left.current > 0) void load();
    // load 与 fill 互相调用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc]);

  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const data = await getPendingNotifications();
      if (!alive.current) return;
      const fresh = data.items.filter((n) => !attempted.current.has(n.id));
      queue.current = fresh;
      left.current = Math.max(0, data.total - (data.items.length - fresh.length));
      setRemaining(left.current);
    } catch {
      return; // 拉取失败不打扰用户，下次轮询再说
    } finally {
      fetching.current = false;
    }
    await fill();
  }, [fill]);

  useEffect(() => {
    alive.current = true;
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive.current = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const dismiss = useCallback(
    (id: number) => {
      const target = shownRef.current.find((s) => s.n.id === id);
      if (!target || target.leaving) return;
      const next = shownRef.current.map((s) => (s.n.id === id ? { ...s, leaving: true } : s));
      shownRef.current = next;
      setShown(next);
      window.setTimeout(() => {
        const rest = shownRef.current.filter((s) => s.n.id !== id);
        shownRef.current = rest;
        setShown(rest);
      }, LEAVE_MS);
      void fill();
    },
    [fill]
  );

  if (shown.length === 0 && remaining === 0) return null;

  // 「还有 N 条」= 服务器上还没弹的，包括已拉到本地排队的
  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[60] flex w-80 flex-col" aria-live="polite">
      {shown.map(({ n, leaving }) => {
        const d = describe(n);
        const Icon = d.icon;
        return (
          <div
            key={n.id}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
              leaving ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
            )}
          >
            <div className="overflow-hidden">
              <div className="pb-2">
                <div
                  role="status"
                  className="group pointer-events-auto relative overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-right-4 duration-200"
                >
                  <button
                    type="button"
                    onClick={() => {
                      dismiss(n.id);
                      if (n.contest_id != null) qc.invalidateQueries({ queryKey: ["contestNotices", n.contest_id] });
                      navigate(d.to);
                    }}
                    className="flex w-full items-start gap-3 py-3 pl-3 pr-9 text-left hover:bg-slate-50"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">{d.title}</span>
                      <span className="block text-sm text-slate-600">{d.text}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="关闭"
                    onClick={() => dismiss(n.id)}
                    className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div
                    className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-slate-400 animate-notice-progress group-hover:[animation-play-state:paused]"
                    onAnimationEnd={(e) => {
                      if (e.animationName === "notice-progress") dismiss(n.id);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="pointer-events-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow">
          还有 {remaining} 条未读通知
        </div>
      )}
    </div>
  );
}
