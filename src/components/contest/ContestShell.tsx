import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { hms, letterOf, parseTime, sortProblems } from "./contestKit";
import {
  announcementKey,
  answeredEvents,
  answeredKey,
  pendingQuestions,
  useContestNotices,
  useSeen,
} from "./noticeKit";

export type ContestTab = "overview" | "problem" | "submissions" | "standings" | "clarifications";

const lastProblemKey = (contestId: number) => `contest:${contestId}:lastProblem`;

export function rememberProblem(contestId: number, pid: string) {
  try {
    sessionStorage.setItem(lastProblemKey(contestId), pid);
  } catch {
    /* 隐私模式下不可写，忽略 */
  }
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** 比赛栏右侧：剩余时间 + 底边进度线 */
function useClock(start: Date | null, end: Date | null) {
  const now = useNow();
  if (!start || !end) return { text: "", tip: "", ratio: 0, hot: false, muted: true };
  const span = `${format(start, "MM-dd HH:mm")} – ${format(end, "MM-dd HH:mm")}`;
  const total = end.getTime() - start.getTime();
  if (now < start.getTime()) {
    const left = (start.getTime() - now) / 1000;
    return {
      text: left > 86400 ? format(start, "MM-dd HH:mm") : hms(left),
      tip: `距开始 · ${span}`,
      ratio: 0,
      hot: false,
      muted: true,
    };
  }
  if (now > end.getTime()) {
    return { text: "已结束", tip: span, ratio: 1, hot: false, muted: true };
  }
  const left = (end.getTime() - now) / 1000;
  return {
    text: hms(left),
    tip: `剩余 · ${span}`,
    ratio: total > 0 ? (now - start.getTime()) / total : 0,
    hot: left < 3600,
    muted: false,
  };
}

/**
 * 公告与答疑提醒：轮询结果里出现了上一轮没有的条目就弹提示。
 * 第一次拿到数据时只记下现状、不弹，避免一进页面就弹一串。
 */
function useNoticeAlerts(contestId: number) {
  const nav = useNavigate();
  const { data } = useContestNotices(contestId);
  const { data: detail } = useQueryToGetContestDetail(contestId || 0);
  const prev = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!data) return;
    const letters = Object.fromEntries((detail?.problem_list ?? []).map((p) => [p.pid, letterOf(p.sort_order)]));
    const where = (pid?: string) => (pid ? `${letters[pid] ?? pid} 题` : "全场");
    const items: { key: string; show: () => void }[] = [
      ...data.announcements.map((a) => ({
        key: `a:${announcementKey(a)}`,
        show: () =>
          toast(`公告：${a.title}`, {
            description: a.content?.slice(0, 80) || undefined,
            duration: 15_000,
            action: { label: "查看", onClick: () => nav(`/contest/${contestId}`) },
          }),
      })),
      ...(data.can_manage
        ? pendingQuestions(data).map((c) => ({
            key: `q:${c.clarification_id}`,
            show: () =>
              toast(`新提问 · ${where(c.problem_pid)}`, {
                description: c.question.slice(0, 80),
                duration: 15_000,
                action: { label: "回复", onClick: () => nav(`/contest/${contestId}/clarifications`) },
              }),
          }))
        : answeredEvents(data).map((c) => ({
            key: `c:${answeredKey(c)}`,
            show: () =>
              toast(c.mine ? `你的提问有了回复 · ${where(c.problem_pid)}` : `答疑 · ${where(c.problem_pid)}`, {
                description: c.answer?.slice(0, 80),
                duration: 15_000,
                action: { label: "查看", onClick: () => nav(`/contest/${contestId}/clarifications`) },
              }),
          }))),
    ];
    const keys = new Set(items.map((i) => i.key));
    if (prev.current) {
      for (const i of items) if (!prev.current.has(i.key)) i.show();
    }
    prev.current = keys;
  }, [data, detail, contestId, nav]);

  return data;
}

export default function ContestShell({
  contestId,
  tab,
  children,
  fill = false,
}: {
  contestId: number;
  tab: ContestTab;
  children: React.ReactNode;
  /** 题目页：内容占满剩余视口高度 */
  fill?: boolean;
}) {
  const { data } = useQueryToGetContestDetail(contestId || 0);
  const start = parseTime(data?.start_time);
  const end = parseTime(data?.end_time);
  const clock = useClock(start, end);
  const notices = useNoticeAlerts(contestId);
  const { seen } = useSeen(contestId);
  const unseenAnnouncements = (notices?.announcements ?? []).filter((a) => !seen.a.includes(announcementKey(a))).length;
  const clarBadge = notices?.can_manage
    ? pendingQuestions(notices).length
    : answeredEvents(notices).filter((c) => !seen.c.includes(answeredKey(c))).length;

  let problemPid: string | null = null;
  try {
    problemPid = sessionStorage.getItem(lastProblemKey(contestId));
  } catch {
    problemPid = null;
  }
  const problems = sortProblems(data?.problem_list);
  if (!problemPid || !problems.some((p) => p.pid === problemPid)) {
    problemPid = problems[0]?.pid ?? null;
  }

  const tabs: { key: ContestTab; label: string; to: string | null; dot?: number }[] = [
    { key: "overview", label: "概览", to: `/contest/${contestId}`, dot: tab === "overview" ? 0 : unseenAnnouncements },
    { key: "problem", label: "题目", to: problemPid ? `/contest/${contestId}/${problemPid}` : null },
    { key: "submissions", label: "提交", to: `/contest/${contestId}/submissions` },
    { key: "standings", label: "排名", to: `/contest/${contestId}/standings` },
    {
      key: "clarifications",
      label: "公告与答疑",
      to: `/contest/${contestId}/clarifications`,
      dot: notices?.can_manage || tab !== "clarifications" ? clarBadge : 0,
    },
  ];

  return (
    <div className={cn("w-full", fill && "flex flex-col h-[calc(100vh-3.5rem)]")}>
      <section className="bg-white flex-none">
        <div className="mx-auto flex h-12 max-w-[1160px] items-center gap-7 px-4 sm:px-7">
          <Link
            to={`/contest/${contestId}`}
            className="hidden max-w-[16rem] truncate border-r pr-7 font-bold leading-[18px] md:block"
            title={data?.title}
          >
            {data?.title ?? " "}
          </Link>
          <nav className="flex h-full gap-5 sm:gap-6">
            {tabs.map((t) =>
              t.to ? (
                <Link
                  key={t.key}
                  to={t.to}
                  className={cn(
                    "flex items-center border-b-2 border-transparent text-sm text-slate-500 hover:text-slate-900",
                    tab === t.key && "border-primary font-semibold text-primary hover:text-primary"
                  )}
                >
                  {t.label}
                  {!!t.dot && (
                    <span
                      className="ml-1 inline-block h-1.5 w-1.5 -translate-y-1.5 rounded-full bg-red-600"
                      title={t.key === "clarifications" && notices?.can_manage ? `${t.dot} 条提问待回复` : `${t.dot} 条新消息`}
                    />
                  )}
                </Link>
              ) : (
                <span key={t.key} className="flex items-center text-sm text-slate-300">
                  {t.label}
                </span>
              )
            )}
          </nav>
          <div className="ml-auto flex items-center gap-5">
            {data?.can_write && (
              <>
                <Link
                  to={`/contest/${contestId}/edit`}
                  title="编辑比赛"
                  className="text-slate-400 hover:text-slate-900"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <Link
                  to={`/contest/${contestId}/members`}
                  title="成员与权限"
                  className="text-slate-400 hover:text-slate-900"
                >
                  <Users className="h-4 w-4" />
                </Link>
              </>
            )}
            <span
              className={cn(
                "font-mono text-[15px] font-medium tracking-wide tabular-nums text-slate-700",
                clock.muted && "text-slate-400",
                clock.hot && "text-orange-700"
              )}
              title={clock.tip}
            >
              {clock.text}
            </span>
          </div>
        </div>
        <div className="h-0.5 bg-slate-100" title={clock.tip}>
          <i
            className="block h-full bg-slate-300 transition-[width] duration-1000"
            style={{ width: `${clock.ratio * 100}%` }}
          />
        </div>
      </section>
      {fill ? (
        <div className="min-h-0 flex-1">{children}</div>
      ) : (
        <div className="mx-auto max-w-[1160px] px-4 pb-20 pt-10 sm:px-7">{children}</div>
      )}
    </div>
  );
}
