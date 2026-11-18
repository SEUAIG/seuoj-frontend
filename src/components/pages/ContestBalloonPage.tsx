import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Check, RefreshCw, Undo2 } from "lucide-react";

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
const MOVE_MS = 450;
/** 已送达：时间 | 题目 | 选手 | 已有气球 | 操作 */
const GRID = "grid grid-cols-[3.25rem_2rem_minmax(0,1fr)_minmax(0,auto)_2.5rem] items-center gap-x-3";
/** 待送：时间 | 题目 | 选手 | 操作（不列已有气球，给选手名留位置） */
const PENDING_GRID = "grid grid-cols-[3.25rem_2rem_minmax(0,1fr)_2.5rem] items-center gap-x-3";

function formatClock(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" });
}

const timeOf = (value: string | null | undefined) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

function displayName(item: ContestBalloonItem) {
  return item.nickname?.trim() || item.username || "未知选手";
}

/** 按背景亮度选黑字或白字，边框取背景加深 */
function badgeStyle(color: string) {
  const hex = /^#[0-9a-f]{6}$/i.test(color) ? color : "#94a3b8";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const light = 0.299 * r + 0.587 * g + 0.114 * b > 160;
  const dark = (v: number) => Math.round(v * 0.7).toString(16).padStart(2, "0");
  return {
    backgroundColor: hex,
    color: light ? "#000000" : "#ffffff",
    borderColor: `#${dark(r)}${dark(g)}${dark(b)}`,
  };
}

/** 题目色块：气球颜色作底，写题目字母（同 DOMjudge 气球页）；一血在外侧加一圈金色 */
function ProblemBadge({
  letter,
  color,
  title,
  first = false,
}: {
  letter: string;
  color: string;
  title?: string;
  first?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded border px-1 text-xs font-bold leading-none",
        first && "ring-2 ring-[#f5b301] ring-offset-1"
      )}
      style={badgeStyle(color)}
      title={first ? `${title ? `${title} · ` : ""}一血` : title}
    >
      {letter}
    </span>
  );
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** 把这一行的副本从原位置滑到另一栏顶部 */
function slideRow(row: HTMLElement, to: DOMRect) {
  if (prefersReducedMotion()) return Promise.resolve();
  const from = row.getBoundingClientRect();
  const ghost = row.cloneNode(true) as HTMLElement;
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    margin: "0",
    zIndex: "60",
    pointerEvents: "none",
    background: "white",
    boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
    borderRadius: "6px",
  });
  document.body.appendChild(ghost);
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const animation = ghost.animate(
    [
      { transform: "translate(0, 0)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.6 },
    ],
    { duration: MOVE_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
  );
  // 标签页在后台时浏览器不推进动画，finished 会一直不来；超时就直接收尾
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, MOVE_MS + 300));
  return Promise.race([animation.finished.then(() => undefined, () => undefined), timeout]).then(() => {
    animation.cancel();
    ghost.remove();
  });
}

/** 取色器：拖动时只改本地颜色，停手 600ms 后才保存一次 */
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

  // 题号 → 字母与题名，按比赛里的题目顺序
  const problemInfo = useMemo(() => {
    const map = new Map<string, { letter: string; title: string; order: number }>();
    for (const p of detail?.problem_list ?? [])
      map.set(p.pid, { letter: letterOf(p.sort_order), title: p.title, order: p.sort_order });
    return (pid: string | null, fallbackTitle?: string | null) => {
      const hit = pid ? map.get(pid) : undefined;
      return {
        letter: hit?.letter ?? pid ?? "?",
        title: hit?.title ?? fallbackTitle ?? "",
        order: hit?.order ?? Number.MAX_SAFE_INTEGER,
      };
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

  // 正在移动的行先从原栏隐去；刚到的行在新栏闪一下
  const [moving, setMoving] = useState<Set<number>>(new Set());
  const [arrived, setArrived] = useState<number | null>(null);
  const rowRefs = useRef(new Map<number, HTMLElement>());
  const pendingListRef = useRef<HTMLDivElement>(null);
  const deliveredListRef = useRef<HTMLDivElement>(null);

  const move = async (item: ContestBalloonItem, toDelivered: boolean) => {
    if (moving.has(item.id)) return;
    const row = rowRefs.current.get(item.id);
    const target = (toDelivered ? deliveredListRef : pendingListRef).current;
    void queryClient.cancelQueries({ queryKey: balloonsKey });
    // 请求和动画同时进行；失败在下面提示一次
    const request = (toDelivered ? deliverContestBalloon : undeliverContestBalloon)(contestId, item.id).then(
      () => null,
      (error: unknown) => error
    );
    const slide = row && target ? slideRow(row, target.getBoundingClientRect()) : Promise.resolve();
    setMoving((prev) => new Set(prev).add(item.id));
    await slide;
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
    setMoving((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    setArrived(item.id);
    setTimeout(() => setArrived((cur) => (cur === item.id ? null : cur)), 1200);
    const error = await request;
    if (error) toast.error(error instanceof Error ? error.message : "操作失败");
    void queryClient.invalidateQueries({ queryKey: balloonsKey });
  };

  const balloons = balloonsQuery.data ?? [];
  const problems = problemsQuery.data ?? [];
  const pending = balloons
    .filter((item) => item.status === "PENDING")
    .sort((a, b) => timeOf(a.createdAt) - timeOf(b.createdAt) || a.id - b.id);
  const delivered = balloons
    .filter((item) => item.status === "DELIVERED")
    .sort((a, b) => timeOf(b.deliveredAt) - timeOf(a.deliveredAt) || b.id - a.id);

  // 每位选手已经拿到（含待送）的气球，按题目顺序
  const totals = useMemo(() => {
    const byUser = new Map<string, ContestBalloonItem[]>();
    for (const b of balloonsQuery.data ?? []) {
      const key = b.username ?? `#${b.id}`;
      byUser.set(key, [...(byUser.get(key) ?? []), b]);
    }
    for (const list of byUser.values()) list.sort((a, b) => problemInfo(a.pid).order - problemInfo(b.pid).order);
    return byUser;
  }, [balloonsQuery.data, problemInfo]);

  // 撞色：两道题同一种颜色，现场分不清
  const clashes = new Map<string, string[]>();
  for (const problem of problems) {
    const key = problem.color.toLowerCase();
    clashes.set(key, [...(clashes.get(key) ?? []), problemInfo(problem.pid, problem.title).letter]);
  }
  const clashWith = (pid: string, color: string) => {
    const self = problemInfo(pid).letter;
    return (clashes.get(color.toLowerCase()) ?? []).filter((other) => other !== self);
  };

  const renderRow = (item: ContestBalloonItem, side: "pending" | "delivered") => {
    const { letter, title } = problemInfo(item.pid, item.title);
    const done = side === "delivered";
    // 一血这一行整条用深底白字，送达后稍淡
    const first = !!item.firstSolve;
    return (
      <div
        key={item.id}
        ref={(el) => {
          if (el) rowRefs.current.set(item.id, el);
          else rowRefs.current.delete(item.id);
        }}
        className={cn(
          done ? GRID : PENDING_GRID,
          "border-b px-3 py-1 text-sm transition-colors duration-700 last:border-b-0",
          done && "text-slate-400",
          first && (done ? "bg-slate-600 text-slate-200" : "bg-slate-800 text-white"),
          moving.has(item.id) && "invisible",
          arrived === item.id && "bg-emerald-50"
        )}
      >
        <span className="font-mono tabular-nums">{formatClock(done ? item.deliveredAt : item.createdAt)}</span>
        <ProblemBadge letter={letter} color={item.color} title={first ? `${title} · 一血` : title} />
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("truncate", !done && "font-medium", !done && !first && "text-slate-900")}>{displayName(item)}</span>
          {item.revoked && (
            <Badge variant="outline" className="shrink-0 border-amber-300 text-amber-700">
              AC 已撤销
            </Badge>
          )}
        </span>
        {done && (
          <span className="flex flex-wrap justify-end gap-1">
            {(totals.get(item.username ?? `#${item.id}`) ?? []).map((b) => (
              <ProblemBadge key={b.id} letter={problemInfo(b.pid).letter} color={b.color} first={!!b.firstSolve} />
            ))}
          </span>
        )}
        {done ? (
          <Button
            size="icon"
            variant="ghost"
            className={cn("h-7 w-7 hover:text-slate-900", first ? "text-slate-200" : "text-slate-400")}
            disabled={moving.has(item.id)}
            onClick={() => void move(item, false)}
            aria-label="撤回"
            title="撤回"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            className="h-7 w-7"
            disabled={moving.has(item.id)}
            onClick={() => void move(item, true)}
            aria-label="送达"
            title="送达"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const column = (
    title: string,
    rows: ContestBalloonItem[],
    side: "pending" | "delivered",
    ref: RefObject<HTMLDivElement>
  ) => (
    <section className="overflow-hidden rounded-md border bg-white">
      <header className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-sm font-semibold">
        {title}
        <Badge variant={side === "pending" ? "secondary" : "outline"}>{rows.length}</Badge>
      </header>
      <div ref={ref} className="max-h-[70vh] overflow-y-auto">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">—</p>
        ) : (
          rows.map((item) => renderRow(item, side))
        )}
      </div>
    </section>
  );

  return (
    <ContestShell contestId={contestId} tab="balloon" wide>
      <Helmet>
        <title>气球 - SEUOJ</title>
      </Helmet>
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-lg font-semibold">气球</h1>
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
            只有比赛管理者可以查看气球。
          </div>
        ) : (
          <>
            <div className="mb-5 grid gap-5 lg:grid-cols-2">
              {column("待送", pending, "pending", pendingListRef)}
              {column("已送达", delivered, "delivered", deliveredListRef)}
            </div>

            <section className="rounded-md border bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold">题目配色</h2>
              <div className="flex flex-wrap gap-2">
                {problems.map((problem) => {
                  const { letter, title } = problemInfo(problem.pid, problem.title);
                  const clash = clashWith(problem.pid, problem.color);
                  return (
                    <label
                      key={problem.pid}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                        clash.length > 0 && "border-destructive"
                      )}
                    >
                      <ProblemBadge letter={letter} color={problem.color} />
                      <span className="max-w-[10rem] truncate">{title}</span>
                      <ColorSwatch
                        value={problem.color}
                        onCommit={(color) => colorMutation.mutate({ pid: problem.pid, color })}
                      />
                      {problem.explicit && (
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-900"
                          onClick={() => colorMutation.mutate({ pid: problem.pid, color: null })}
                        >
                          恢复默认
                        </button>
                      )}
                      {clash.length > 0 && <span className="text-destructive">与 {clash.join("、")} 同色</span>}
                    </label>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </ContestShell>
  );
}
