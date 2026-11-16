import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContestShell from "@/components/contest/ContestShell";
import { isClientError, letterOf } from "@/components/contest/contestKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { cn } from "@/lib/utils";
import {
  deliverContestBalloon,
  listContestBalloonProblems,
  listContestBalloons,
  setContestBalloonColor,
  undeliverContestBalloon,
  type ContestBalloonItem,
} from "@/services/Contest/balloon";

const POLL_MS = 5000;
const RUN_MS = 900;

function formatClock(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("zh-CN", { hour12: false });
}

const timeOf = (value: string | null | undefined) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

function displayName(item: ContestBalloonItem) {
  return item.nickname?.trim() || item.username || "未知选手";
}

/** 带线的小气球，颜色与题目配色一致 */
function BalloonIcon({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 36" className={className} aria-hidden="true">
      <ellipse cx="12" cy="11" rx="9" ry="10.5" fill={color} stroke="rgba(15,23,42,0.35)" strokeWidth="1" />
      <ellipse cx="8.5" cy="7" rx="2.2" ry="3.2" fill="white" opacity="0.45" />
      <path d="M10.5 21.5 L13.5 21.5 L12 23.5 Z" fill={color} stroke="rgba(15,23,42,0.35)" strokeWidth="0.8" />
      <path d="M12 23.5 C 9 27, 15 30, 12 35" fill="none" stroke="rgba(15,23,42,0.45)" strokeWidth="1" />
    </svg>
  );
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * 送达 / 撤回动画：一个小人举着这题颜色的气球，从这一行跑到另一栏顶部。
 * 用 Web Animations API 在 body 上画一个临时元素，跑完自动移除。
 */
function runToOtherSide(from: DOMRect, to: DOMRect, color: string, label: string, rightward: boolean) {
  if (prefersReducedMotion()) return Promise.resolve();
  const runner = document.createElement("div");
  runner.setAttribute("aria-hidden", "true");
  runner.style.cssText =
    "position:fixed;left:0;top:0;z-index:60;pointer-events:none;display:flex;align-items:flex-end;gap:2px;";
  const balloon = `
    <span style="display:flex;flex-direction:column;align-items:center;margin-bottom:14px">
      <svg viewBox="0 0 24 36" width="26" height="39">
        <ellipse cx="12" cy="11" rx="9" ry="10.5" fill="${color}" stroke="rgba(15,23,42,0.35)" stroke-width="1"/>
        <ellipse cx="8.5" cy="7" rx="2.2" ry="3.2" fill="white" opacity="0.45"/>
        <path d="M12 21.5 C 9 26, 15 30, 12 35" fill="none" stroke="rgba(15,23,42,0.45)" stroke-width="1"/>
      </svg>
      <span style="font:600 12px/1 system-ui;color:#0f172a">${label}</span>
    </span>`;
  // 🏃 默认朝左，往右跑时镜像；气球举在身前
  const person = `<span style="display:inline-block;font-size:36px;line-height:1;transform:scaleX(${rightward ? -1 : 1})">🏃</span>`;
  runner.innerHTML = rightward ? person + balloon : balloon + person;
  document.body.appendChild(runner);

  const x0 = from.left + (rightward ? from.width * 0.25 : from.width * 0.6);
  const y0 = from.top + from.height / 2 - 30;
  const x1 = to.left + to.width / 2 - 25;
  const y1 = to.top - 8;
  // 一路小跳：每段中点抬高一点，看起来是在跑
  const hops = 6;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= hops; i++) {
    const t = i / hops;
    // 全程不透明，只在最后一段淡出
    const opacity = i === hops ? 0 : 1;
    frames.push({ transform: `translate(${x0 + (x1 - x0) * t}px, ${y0 + (y1 - y0) * t}px)`, opacity, offset: t });
    if (i < hops) {
      const m = t + 0.5 / hops;
      frames.push({ transform: `translate(${x0 + (x1 - x0) * m}px, ${y0 + (y1 - y0) * m - 10}px)`, opacity: 1, offset: m });
    }
  }
  const animation = runner.animate(frames, { duration: RUN_MS, easing: "linear", fill: "forwards" });
  // 标签页在后台时浏览器不推进动画，finished 会一直不来；超时就直接收尾，记录照样挪过去
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, RUN_MS + 300));
  return Promise.race([animation.finished.then(() => undefined, () => undefined), timeout]).then(() => {
    animation.cancel();
    runner.remove();
  });
}

/**
 * 取色器：拖动时只改本地颜色，停手 600ms 后才保存一次。
 * 原生 input[type=color] 拖动过程中会连续触发 onChange，直接保存会刷出一串请求和提示。
 */
function ColorSwatch({ value, onCommit }: { value: string; onCommit: (color: string) => void }) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!timer.current) setDraft(value);
  }, [value]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (
    <input
      type="color"
      className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          timer.current = null;
          if (next.toLowerCase() !== value.toLowerCase()) onCommit(next);
        }, 600);
      }}
    />
  );
}

export default function ContestBalloonPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const queryClient = useQueryClient();
  const balloonsKey = useMemo(() => ["contest-balloons", contestId], [contestId]);

  const { data: detail } = useQueryToGetContestDetail(contestId);
  const canManage = Boolean(detail?.can_write);

  // 题号 → “A 题名”：按比赛里的题目顺序给字母，不显示 Pxxxx
  const problemLabel = useMemo(() => {
    const map = new Map<string, { letter: string; title: string }>();
    for (const p of detail?.problem_list ?? []) map.set(p.pid, { letter: letterOf(p.sort_order), title: p.title });
    return (pid: string | null, fallbackTitle?: string | null) => {
      const hit = pid ? map.get(pid) : undefined;
      return { letter: hit?.letter ?? pid ?? "?", title: hit?.title ?? fallbackTitle ?? "" };
    };
  }, [detail?.problem_list]);

  const balloonsQuery = useQuery({
    queryKey: balloonsKey,
    queryFn: () => listContestBalloons(contestId),
    // 只有比赛管理者能看队列；被拒（4xx）就停，失败不弹全局提示，页面保留上次的数据
    enabled: canManage && Number.isFinite(contestId) && contestId > 0,
    refetchInterval: (query) => (isClientError(query.state.error) ? false : POLL_MS),
    refetchIntervalInBackground: false,
    retry: false,
    meta: { silentError: true },
  });

  const problemsQuery = useQuery({
    queryKey: ["contest-balloon-problems", contestId],
    queryFn: () => listContestBalloonProblems(contestId),
    enabled: canManage,
  });

  const colorMutation = useMutation({
    mutationFn: ({ pid, color }: { pid: string; color: string | null }) =>
      setContestBalloonColor(contestId, pid, color),
    onSuccess: () => {
      toast.success("颜色已保存");
      void queryClient.invalidateQueries({ queryKey: ["contest-balloon-problems", contestId] });
      void queryClient.invalidateQueries({ queryKey: balloonsKey });
    },
  });

  // 正在跑的记录先从原栏隐去；刚到的记录在新栏闪一下
  const [running, setRunning] = useState<Set<number>>(new Set());
  const [arrived, setArrived] = useState<number | null>(null);
  const rowRefs = useRef(new Map<number, HTMLElement>());
  const pendingListRef = useRef<HTMLDivElement>(null);
  const deliveredListRef = useRef<HTMLDivElement>(null);

  const move = async (item: ContestBalloonItem, toDelivered: boolean) => {
    if (running.has(item.id)) return;
    const row = rowRefs.current.get(item.id);
    const target = (toDelivered ? deliveredListRef : pendingListRef).current;
    const { letter } = problemLabel(item.pid, item.title);
    setRunning((prev) => new Set(prev).add(item.id));
    void queryClient.cancelQueries({ queryKey: balloonsKey });
    // 请求和动画同时进行；请求失败时由下面的 catch 提示，不走全局提示
    const request = (toDelivered ? deliverContestBalloon : undeliverContestBalloon)(contestId, item.id).then(
      () => null,
      (error: unknown) => error
    );
    if (row && target) {
      await runToOtherSide(row.getBoundingClientRect(), target.getBoundingClientRect(), item.color, letter, toDelivered);
    }
    // 动画跑完先在本地挪过去，再以服务器为准刷新
    queryClient.setQueryData<ContestBalloonItem[]>(balloonsKey, (old) =>
      (old ?? []).map((b) =>
        b.id === item.id
          ? {
              ...b,
              status: toDelivered ? "DELIVERED" : "PENDING",
              deliveredAt: toDelivered ? new Date().toISOString() : null,
            }
          : b
      )
    );
    setRunning((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    setArrived(item.id);
    setTimeout(() => setArrived((cur) => (cur === item.id ? null : cur)), 1500);
    const error = await request;
    if (error) toast.error(error instanceof Error ? error.message : "操作失败");
    void queryClient.invalidateQueries({ queryKey: balloonsKey });
  };

  const balloons = balloonsQuery.data ?? [];
  const problems = problemsQuery.data ?? [];
  // 待送：先 AC 的在上，按顺序送；已送：最近送出的在上
  const pending = balloons
    .filter((item) => item.status === "PENDING")
    .sort((a, b) => timeOf(a.createdAt) - timeOf(b.createdAt) || a.id - b.id);
  const delivered = balloons
    .filter((item) => item.status === "DELIVERED")
    .sort((a, b) => timeOf(b.deliveredAt) - timeOf(a.deliveredAt) || b.id - a.id);

  // 撞色：两道题同一种颜色，现场分不清，提示管理者手动改
  const clashes = new Map<string, string[]>();
  for (const problem of problems) {
    const key = problem.color.toLowerCase();
    clashes.set(key, [...(clashes.get(key) ?? []), problemLabel(problem.pid, problem.title).letter]);
  }
  const clashWith = (pid: string, color: string) => {
    const self = problemLabel(pid).letter;
    return (clashes.get(color.toLowerCase()) ?? []).filter((other) => other !== self);
  };

  const renderRow = (item: ContestBalloonItem, side: "pending" | "delivered") => {
    const { letter, title } = problemLabel(item.pid, item.title);
    return (
      <li
        key={item.id}
        ref={(el) => {
          if (el) rowRefs.current.set(item.id, el);
          else rowRefs.current.delete(item.id);
        }}
        className={cn(
          "flex items-center gap-3 border-b px-3 py-2.5 transition-[opacity,background-color] duration-500 last:border-b-0",
          running.has(item.id) && "opacity-0",
          arrived === item.id && "bg-emerald-50"
        )}
      >
        <BalloonIcon color={item.color} className="h-9 w-6 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-base font-semibold">{letter}</span>
            <span className="truncate text-sm text-slate-600" title={title}>
              {title}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="font-medium text-slate-800">{displayName(item)}</span>
            <span>
              {side === "pending" ? `AC ${formatClock(item.createdAt)}` : `送达 ${formatClock(item.deliveredAt)}`}
            </span>
            {item.revoked && (
              <Badge
                variant="outline"
                className="border-amber-300 text-amber-700"
                title="这道题的 AC 已被重测改判或跳过，选手目前没有通过"
              >
                AC 已撤销
              </Badge>
            )}
          </div>
        </div>
        {side === "pending" ? (
          <Button size="sm" disabled={running.has(item.id)} onClick={() => void move(item, true)}>
            送达
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={running.has(item.id)}
            onClick={() => void move(item, false)}
          >
            撤回
          </Button>
        )}
      </li>
    );
  };

  const column = (
    title: string,
    count: number,
    hint: string,
    ref: RefObject<HTMLDivElement>,
    rows: ContestBalloonItem[],
    side: "pending" | "delivered",
    empty: string
  ) => (
    <section className="overflow-hidden rounded-md border">
      <header className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-sm font-semibold">
        {title}
        <Badge variant={side === "pending" ? "secondary" : "outline"}>{count}</Badge>
        <span className="ml-auto text-xs font-normal text-muted-foreground">{hint}</span>
      </header>
      <div ref={ref} className="max-h-[65vh] overflow-y-auto">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul>{rows.map((item) => renderRow(item, side))}</ul>
        )}
      </div>
    </section>
  );

  return (
    <ContestShell contestId={contestId} tab="balloon">
      <Helmet>
        <title>气球 - SEUOJ</title>
      </Helmet>
      <div className="mx-auto w-full max-w-[1160px] px-4 py-5 sm:px-7">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">气球队列</h1>
          <span className="text-xs text-muted-foreground">每 {POLL_MS / 1000} 秒自动刷新</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => void balloonsQuery.refetch()}
            disabled={balloonsQuery.isFetching}
            aria-label="刷新"
          >
            <RefreshCw className={balloonsQuery.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </Button>
        </div>

        {!canManage ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            只有拥有该比赛管理权限的账号（教师/管理员或比赛负责人）可以查看气球队列。
          </div>
        ) : (
          <>
            <div className="mb-5 grid gap-5 md:grid-cols-2">
              {column(
                "待送",
                pending.length,
                "先 AC 的在上",
                pendingListRef,
                pending,
                "pending",
                balloonsQuery.isLoading ? "加载中..." : "没有待送的气球"
              )}
              {column("已送达", delivered.length, "最近送出的在上", deliveredListRef, delivered, "delivered", "还没有送出气球")}
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold">题目配色</h2>
                <span className="text-xs text-muted-foreground">未设置时按题目顺序自动分配</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {problems.length === 0 ? (
                  <span className="text-xs text-muted-foreground">暂无题目</span>
                ) : (
                  problems.map((problem) => {
                    const { letter, title } = problemLabel(problem.pid, problem.title);
                    const clash = clashWith(problem.pid, problem.color);
                    return (
                      <label
                        key={problem.pid}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                          clash.length > 0 && "border-destructive"
                        )}
                        title={clash.length ? `与 ${clash.join("、")} 颜色相同` : title}
                      >
                        <span className="font-semibold">{letter}</span>
                        <span className="max-w-[10rem] truncate text-slate-600">{title}</span>
                        <ColorSwatch
                          value={problem.color}
                          onCommit={(color) => colorMutation.mutate({ pid: problem.pid, color })}
                        />
                        {problem.explicit ? (
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => colorMutation.mutate({ pid: problem.pid, color: null })}
                          >
                            恢复自动
                          </button>
                        ) : (
                          <span className="text-muted-foreground">自动</span>
                        )}
                        {clash.length > 0 && <span className="text-destructive">撞色 {clash.join("、")}</span>}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ContestShell>
  );
}
