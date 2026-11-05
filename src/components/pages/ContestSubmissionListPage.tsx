import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { Loader2 } from "lucide-react";
import { getContestSubmissionPage } from "@/services/Contest/getContestSubmissionPage";
import ContestShell from "@/components/contest/ContestShell";
import Verdict from "@/components/contest/Verdict";
import SubmitterLink from "@/components/common/SubmitterLink";
import { isAcm, isMine, letterOf, parseTime, scoreColor, useCurrentUser } from "@/components/contest/contestKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { cn } from "@/lib/utils";

const SIZE = 30;
const TH = "whitespace-nowrap px-2.5 pb-2 pt-3 text-left text-xs font-medium text-slate-500";
const TD = "whitespace-nowrap border-t border-slate-100 px-2.5 py-3 align-middle";

function when(value: string) {
  const d = parseTime(value);
  if (!d) return value;
  return isSameDay(d, new Date()) ? format(d, "HH:mm:ss") : format(d, "MM-dd HH:mm");
}

export default function ContestSubmissionListPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const nav = useNavigate();
  const user = useCurrentUser();
  const [page, setPage] = useState(1);
  const { data: detail } = useQueryToGetContestDetail(contestId || 0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contestSubmissions", contestId, page],
    queryFn: () => getContestSubmissionPage(contestId, { current: page, size: SIZE }),
    enabled: !!contestId,
    placeholderData: keepPreviousData,
    // 有评测中的提交时自动刷新
    refetchInterval: (q) =>
      q.state.data?.records?.some((r) => r.status === "Pending" || r.status === "Running") ? 3000 : false,
  });

  const records = data?.records ?? [];
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / SIZE));
  const showScore = !!detail?.rule_type && !isAcm(detail.rule_type);
  const letters = Object.fromEntries((detail?.problem_list ?? []).map((p) => [p.pid, letterOf(p.sort_order)]));
  // 选手只能看到自己的提交，只有比赛管理者需要“选手”这一列
  const showWho = !!detail?.can_write;
  const cols = (showScore ? 7 : 6) - (showWho ? 0 : 1);
  const start = parseTime(detail?.start_time);
  const end = parseTime(detail?.end_time);
  /** 比赛时间外的提交（管理者赛前验题、赛后补题）不计入榜单 */
  const outside = (value: string) => {
    const d = parseTime(value);
    if (!d || !start || !end) return null;
    return d < start ? "赛前" : d > end ? "赛后" : null;
  };

  return (
    <ContestShell contestId={contestId} tab="submissions">
      <Helmet>
        <title>{detail?.title ? `提交 - ${detail.title} - SEUOJ` : "提交 - SEUOJ"}</title>
      </Helmet>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className={cn(TH, "hidden sm:table-cell")}>#</th>
            <th className={TH}>时间</th>
            {showWho && <th className={cn(TH, "w-full")}>选手</th>}
            <th className={cn(TH, !showWho && "w-full")}>题目</th>
            <th className={TH}>结果</th>
            {showScore && <th className={cn(TH, "text-right")}>分数</th>}
            <th className={cn(TH, "hidden sm:table-cell")}>语言</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={cols} className="py-20 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td colSpan={cols} className="py-20 text-center text-slate-500">
                {error instanceof Error ? error.message : "加载失败"}
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={cols} className="py-20 text-center text-slate-400">
                —
              </td>
            </tr>
          ) : (
            records.map((r) => {
              const mine = showWho && isMine(r, user);
              const detailPath = `/contest/${contestId}/submission/${r.submission_no}`;
              return (
                <tr
                  key={r.submission_no}
                  className={cn("cursor-pointer", mine ? "bg-primary/[0.07]" : "hover:bg-white")}
                  onClick={() => nav(detailPath)}
                >
                  <td className={cn(TD, "hidden font-mono text-slate-400 sm:table-cell")} title={r.submission_no}>
                    {r.submission_no.slice(0, 8)}
                  </td>
                  <td className={cn(TD, "font-mono text-slate-500")}>
                    {when(r.submit_time)}
                    {outside(r.submit_time) && (
                      <span className="ml-2 font-sans text-xs text-slate-400" title="不计入榜单">
                        {outside(r.submit_time)}
                      </span>
                    )}
                  </td>
                  {showWho && (
                    <td className={cn(TD, mine && "font-semibold")}>
                      <SubmitterLink
                        username={r.username}
                        nickname={r.nickname}
                        userId={r.user_id}
                        className="text-inherit hover:underline"
                      />
                    </td>
                  )}
                  <td className={TD}>
                    <Link
                      to={`/contest/${contestId}/${r.problem.pid}`}
                      title={r.problem.title}
                      onClick={(e) => e.stopPropagation()}
                      className="font-display font-semibold hover:text-primary"
                    >
                      {letters[r.problem.pid] ?? r.problem.pid}
                    </Link>
                  </td>
                  <td className={TD}>
                    <Verdict status={r.status} verdict={r.verdict} />
                  </td>
                  {showScore && (
                    <td
                      className={cn(TD, "text-right font-mono")}
                      style={r.score != null ? { color: scoreColor(r.score) } : undefined}
                    >
                      {r.score ?? ""}
                    </td>
                  )}
                  <td className={cn(TD, "hidden text-slate-500 sm:table-cell")}>{r.language ?? ""}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-5 font-mono text-sm text-slate-500">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="hover:text-slate-900 disabled:text-slate-300"
            aria-label="上一页"
          >
            ←
          </button>
          <span className="tabular-nums">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="hover:text-slate-900 disabled:text-slate-300"
            aria-label="下一页"
          >
            →
          </button>
        </div>
      )}
    </ContestShell>
  );
}
