import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { format, isSameDay } from "date-fns";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import ContestShell from "@/components/contest/ContestShell";
import ContestAnnouncements from "@/components/contest/ContestAnnouncements";
import { useContestNotices } from "@/components/contest/noticeKit";
import {
  STATE_TEXT,
  STATUS_LABEL,
  cellStateOf,
  contestStatusOf,
  hm,
  isAcm,
  isMine,
  letterOf,
  parseTime,
  problemStats,
  scoreColor,
  sortProblems,
  useContestStandings,
  useCurrentUser,
} from "@/components/contest/contestKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { registerContest, unregisterContest } from "@/services/Contest/registerContest";
import { deleteContest } from "@/services/Contest/deleteContest";
import type { ContestRuleType, ContestStandingsScoreDetail, ContestStatus } from "@/models/contest";
import { cn } from "@/lib/utils";

const DOT: Record<ContestStatus, string> = {
  NOT_STARTED: "bg-blue-600",
  IN_PROGRESS: "bg-green-700",
  FINISHED: "bg-slate-300",
};

function SecHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-slate-900 pb-2.5 text-[13px] font-bold tracking-wide">
      {children}
    </div>
  );
}

function Stat({ value, sub, label }: { value: React.ReactNode; sub?: React.ReactNode; label: string }) {
  return (
    <div>
      <b className="block font-display text-[34px] font-medium leading-none">
        {value}
        {sub != null && <small className="text-xl font-normal text-slate-400"> / {sub}</small>}
      </b>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

/** 概览题目行里「我」这一格 */
function MyCell({ d, rule }: { d?: ContestStandingsScoreDetail; rule?: ContestRuleType }) {
  const state = cellStateOf(d, rule);
  if (!d || !state) return null;
  if (!isAcm(rule)) {
    return (
      <span className="font-mono text-[13px] font-semibold" style={{ color: scoreColor(d.score ?? 0) }}>
        {d.score}
      </span>
    );
  }
  if (state === "ok") {
    return (
      <span className="inline-flex items-center gap-1.5 text-green-700" title={`${hm(d.acceptedTime ?? 0)} 通过`}>
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        <span className="font-mono text-[13px] text-slate-500">{hm(d.acceptedTime ?? 0)}</span>
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-1 font-mono text-[13px] font-semibold", STATE_TEXT[state])}
      title={d.unacceptedCount ? `${d.unacceptedCount} 次未通过` : "未通过"}
    >
      <X className="h-3.5 w-3.5" strokeWidth={3} />
      {d.unacceptedCount || ""}
    </span>
  );
}

function timeRange(start: Date | null, end: Date | null) {
  if (!start || !end) return "";
  const day = format(start, "yyyy 年 M 月 d 日");
  return isSameDay(start, end)
    ? `${day}\u3000${format(start, "HH:mm")} — ${format(end, "HH:mm")}`
    : `${day} ${format(start, "HH:mm")} — ${format(end, "yyyy 年 M 月 d 日 HH:mm")}`;
}

export default function ContestListDetailPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const nav = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useCurrentUser();
  const [busy, setBusy] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, isLoading, isError, error, refetch } = useQueryToGetContestDetail(contestId || 0);
  const status = contestStatusOf(data);
  const { data: standings } = useContestStandings(contestId, data);
  const { data: notices } = useContestNotices(contestId);

  const toggleRegister = async (register: boolean) => {
    if (!contestId) return;
    setBusy(true);
    try {
      const res = register ? await registerContest(contestId) : await unregisterContest(contestId);
      if (res.code === 0) {
        toast.success(register ? "报名成功" : "已取消报名");
        refetch();
      } else {
        toast.error(res.message || (register ? "报名失败" : "取消报名失败"));
      }
    } catch {
      toast.error("请求出错");
    } finally {
      setBusy(false);
    }
  };

  const body = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      );
    }
    if (isError || !data) {
      return (
        <div className="py-24 text-center text-slate-500">
          <p className="mb-2 text-lg font-semibold text-slate-700">加载比赛信息失败</p>
          <p>{error instanceof Error ? error.message : "未知错误"}</p>
        </div>
      );
    }

    const rule = data.rule_type;
    const problems = sortProblems(data.problem_list);
    const stats = problemStats(standings);
    const participants = standings?.records.length ?? 0;
    const me = standings?.records.find((r) => isMine(r, user));
    const start = parseTime(data.start_time);
    const end = parseTime(data.end_time);
    const isRegistered = data.is_registered ?? false;
    const fullScore = problems.length * 100;
    const hasAside = !!data.can_write || !!notices?.announcements.length;

    return (
      <>
        <div className="flex flex-col gap-6 border-b pb-9 md:flex-row md:items-end md:gap-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <span className={cn("inline-block h-[7px] w-[7px] rounded-full", DOT[status])} />
              {STATUS_LABEL[status]}
              {isRegistered && data.can_unregister && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleRegister(false)}
                  className="ml-3 text-slate-400 underline-offset-2 hover:text-slate-900 hover:underline"
                >
                  取消报名
                </button>
              )}
            </div>
            <h1 className="mb-2 mt-2.5 font-display text-[28px] font-semibold leading-tight tracking-wide md:text-4xl">
              {data.title}
            </h1>
            {data.subtitle && <p className="mb-1 text-slate-600">{data.subtitle}</p>}
            {rule && <div className="text-[13px] text-slate-500">赛制：{rule}</div>}
            <div className="text-[13px] text-slate-500">{timeRange(start, end)}</div>
          </div>
          <div className="flex shrink-0 items-end gap-9 md:ml-auto">
            {me ? (
              isAcm(rule) ? (
                <>
                  <Stat value={me.rank ?? "*"} label="名" />
                  <Stat value={me.score} sub={problems.length} label="通过" />
                  <Stat value={me.penalty ?? 0} label="罚时" />
                </>
              ) : (
                <>
                  <Stat value={me.rank ?? "*"} label="名" />
                  <Stat value={me.score} sub={fullScore} label="总分" />
                </>
              )
            ) : isAuthenticated && !isRegistered && status !== "FINISHED" ? (
              <Button onClick={() => toggleRegister(true)} disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                报名
              </Button>
            ) : null}
          </div>
        </div>

        <div className={cn("mt-10 grid gap-9 lg:gap-14", hasAside && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
          <div className="min-w-0 space-y-11">
            {data.description && (
              <section>
                <SecHead>比赛说明</SecHead>
                <div className="prose prose-sm prose-slate mt-4 max-w-none">
                  <MarkdownRenderer>{data.description}</MarkdownRenderer>
                </div>
              </section>
            )}
            <section>
              <SecHead>题目</SecHead>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {problems.map((p) => {
                    const d = me?.score_details?.[p.pid];
                    const state = cellStateOf(d, rule);
                    const st = stats[p.pid];
                    return (
                      <tr
                        key={p.pid}
                        className="cursor-pointer hover:bg-white"
                        onClick={() => nav(`/contest/${contestId}/${p.pid}`)}
                      >
                        <td
                          className={cn(
                            "w-7 border-t border-slate-100 px-2.5 py-3 font-display text-[17px] font-semibold",
                            state && STATE_TEXT[state]
                          )}
                        >
                          {letterOf(p.sort_order)}
                        </td>
                        <td className="w-full border-t border-slate-100 px-2.5 py-3">
                          <Link
                            to={`/contest/${contestId}/${p.pid}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-primary"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap border-t border-slate-100 px-2.5 py-3">
                          <MyCell d={d} rule={rule} />
                        </td>
                        <td className="whitespace-nowrap border-t border-slate-100 px-2.5 py-3 text-right">
                          {st && participants > 0 && (
                            <span
                              className="inline-flex items-center gap-2.5"
                              title={`${st.solvers} 人通过 · ${st.tried} 人尝试 · 共 ${participants} 人`}
                            >
                              <span className="relative h-[3px] w-[72px] bg-slate-200">
                                <i
                                  className="absolute inset-y-0 left-0 bg-green-700"
                                  style={{ width: `${(100 * st.solvers) / participants}%` }}
                                />
                              </span>
                              <span className="min-w-[2.5rem] text-right font-mono text-[13px] text-slate-700">
                                {st.solvers}
                              </span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {problems.length === 0 && (
                    <tr>
                      <td className="border-t border-slate-100 py-10 text-center text-slate-400">—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>

          {hasAside && (
            <aside className="space-y-11 lg:border-l lg:pl-10">
              <ContestAnnouncements contestId={contestId} />
              {data.can_write && (
                <section>
                  <SecHead>管理</SecHead>
                  <div className="mt-2 flex flex-col text-sm">
                    <Link to={`/contest/${contestId}/edit`} className="border-b border-slate-100 py-2.5 hover:text-primary">
                      编辑比赛
                    </Link>
                    <Link to={`/contest/${contestId}/members`} className="border-b border-slate-100 py-2.5 hover:text-primary">
                      成员与权限
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="border-b border-slate-100 py-2.5 text-left text-red-600 hover:text-red-700"
                    >
                      删除比赛
                    </button>
                  </div>
                  {rule === "ACM" && data.scoring_config && (
                    <pre className="mt-4 overflow-x-auto font-mono text-xs text-slate-500" title="计分配置">
                      {data.scoring_config}
                    </pre>
                  )}
                  {rule === "CUSTOM" && data.scoring_script && (
                    <pre className="mt-4 max-h-60 overflow-auto font-mono text-xs text-slate-500" title="自定义评分脚本">
                      {data.scoring_script}
                    </pre>
                  )}
                </section>
              )}
            </aside>
          )}
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除比赛？</DialogTitle>
              <DialogDescription>
                此操作将删除比赛 "{data.title}"，包括其所有关联的题目数据。此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                取消
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const res = await deleteContest(contestId);
                    if (res.code === 0) {
                      toast.success("比赛已删除");
                      nav("/contest");
                    } else {
                      toast.error(res.message || "删除失败");
                    }
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "删除请求发生错误");
                  } finally {
                    setIsDeleting(false);
                    setIsDeleteDialogOpen(false);
                  }
                }}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <ContestShell contestId={contestId} tab="overview">
      <Helmet>
        <title>{data?.title ? `${data.title} - SEUOJ` : "比赛 - SEUOJ"}</title>
      </Helmet>
      {body()}
    </ContestShell>
  );
}
