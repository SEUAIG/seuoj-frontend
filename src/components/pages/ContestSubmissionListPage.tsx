import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { Loader2, X } from "lucide-react";
import { getContestSubmissionPage } from "@/services/Contest/getContestSubmissionPage";
import ContestShell from "@/components/contest/ContestShell";
import Verdict from "@/components/contest/Verdict";
import Segmented from "@/components/contest/Segmented";
import SubmitterLink from "@/components/common/SubmitterLink";
import { isAcm, isMine, letterOf, parseTime, scoreColor, sortProblems, useCurrentUser } from "@/components/contest/contestKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { cn } from "@/lib/utils";
import SkipSubmissionsDialog from "@/components/bussiness/SkipSubmissionsDialog";
import { skipContestSubmissions } from "@/services/Submission/skipSubmissions";
import RejudgeDialog from "@/components/bussiness/RejudgeDialog";
import { rejudgeInContest } from "@/services/Submission/rejudge";

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
  // 筛选条件放在地址栏里：榜单可以直接链接到“某人某题的提交”，刷新也不丢
  const [params, setParams] = useSearchParams();
  const pid = params.get("pid") ?? "";
  const result = (params.get("result") ?? "") as "" | "accepted" | "rejected" | "skipped";
  const username = params.get("user") ?? "";
  const [userInput, setUserInput] = useState(username);
  useEffect(() => setUserInput(username), [username]);
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  };
  const queryClient = useQueryClient();
  // 管理者勾选（跨页、跨筛选保留），key 为 submission_no
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [skipAction, setSkipAction] = useState<null | { skipped: boolean; whole: boolean }>(null);
  // 重测：selected = 勾选的提交；problem = 本场当前筛选题目的全部提交
  const [rejudgeAction, setRejudgeAction] = useState<null | "selected" | "problem">(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contestSubmissions", contestId, page, pid, result, username],
    queryFn: () =>
      getContestSubmissionPage(contestId, {
        current: page,
        size: SIZE,
        pid: pid || undefined,
        result: result || undefined,
        username: username || undefined,
      }),
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
  const cols = (showScore ? 7 : 6) + (showWho ? 1 : -1);
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
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          label="题目"
          value={pid}
          onChange={(v) => setFilter("pid", v)}
          options={[
            { value: "", label: "全部题目" },
            ...sortProblems(detail?.problem_list).map((p) => ({
              value: p.pid,
              label: letterOf(p.sort_order),
              title: p.title,
            })),
          ]}
        />
        <Segmented
          label="结果"
          value={result}
          onChange={(v) => setFilter("result", v)}
          options={[
            { value: "", label: "全部结果" },
            { value: "accepted", label: "通过" },
            { value: "rejected", label: "未通过" },
            { value: "skipped", label: "已跳过" },
          ]}
        />
        {showWho &&
          (username ? (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-700">
              选手 <b className="font-mono font-medium">{username}</b>
              <button
                type="button"
                aria-label="清除选手筛选"
                onClick={() => setFilter("user", "")}
                className="text-slate-400 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFilter("user", userInput.trim());
              }}
            >
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="按账号名筛选"
                aria-label="按账号名筛选"
                className="w-40 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[13px] outline-none focus:border-primary"
              />
            </form>
          ))}
      </div>
      {showWho && (selected.size > 0 || username || pid) && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md bg-slate-100 px-3 py-2 text-[13px] text-slate-700">
          {selected.size > 0 && (
            <>
              <span>已选 {selected.size} 条</span>
              <button type="button" className="font-medium text-red-600 hover:underline" onClick={() => setSkipAction({ skipped: true, whole: false })}>
                跳过所选
              </button>
              <button type="button" className="font-medium hover:underline" onClick={() => setSkipAction({ skipped: false, whole: false })}>
                取消跳过
              </button>
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => setRejudgeAction("selected")}>
                重测所选
              </button>
              <button type="button" className="text-slate-500 hover:underline" onClick={() => setSelected(new Set())}>
                清空选择
              </button>
            </>
          )}
          {pid && !username && (
            <span className="ml-auto">
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => setRejudgeAction("problem")}>
                重测本场 {letters[pid] ?? pid} 题全部提交
              </button>
            </span>
          )}
          {username && (
            <span className="ml-auto flex gap-4">
              <button type="button" className="font-medium text-red-600 hover:underline" onClick={() => setSkipAction({ skipped: true, whole: true })}>
                跳过 {username} 本场全部提交
              </button>
              <button type="button" className="font-medium hover:underline" onClick={() => setSkipAction({ skipped: false, whole: true })}>
                全部取消跳过
              </button>
            </span>
          )}
        </div>
      )}
      <SkipSubmissionsDialog
        open={skipAction !== null}
        skipped={skipAction?.skipped ?? true}
        target={skipAction?.whole ? ` ${username} 本场的全部提交` : ` ${selected.size} 条提交`}
        onOpenChange={(open) => !open && setSkipAction(null)}
        run={(reason) =>
          skipContestSubmissions(
            contestId,
            skipAction?.whole
              ? { username, skipped: skipAction.skipped, reason }
              : { submissionNos: Array.from(selected), skipped: skipAction?.skipped ?? true, reason }
          )
        }
        onDone={() => {
          if (!skipAction?.whole) setSelected(new Set());
          queryClient.invalidateQueries({ queryKey: ["contestSubmissions", contestId] });
          queryClient.invalidateQueries({ queryKey: ["contestStandings"] });
        }}
      />
      <RejudgeDialog
        open={rejudgeAction !== null}
        target={rejudgeAction === "problem" ? `本场 ${letters[pid] ?? pid} 题的全部提交` : ` ${selected.size} 条提交`}
        note={rejudgeAction === "problem" ? "只重测本场比赛里的提交，题库和其他比赛的提交不受影响。" : undefined}
        onOpenChange={(open) => !open && setRejudgeAction(null)}
        run={() =>
          rejudgeAction === "problem"
            ? rejudgeInContest(contestId, { pid })
            : rejudgeInContest(contestId, { submissionNos: Array.from(selected) })
        }
        onDone={() => {
          if (rejudgeAction === "selected") setSelected(new Set());
          queryClient.invalidateQueries({ queryKey: ["contestSubmissions", contestId] });
          queryClient.invalidateQueries({ queryKey: ["contestStandings"] });
        }}
      />
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {showWho && (
              <th className={cn(TH, "w-8")}>
                <input
                  type="checkbox"
                  aria-label="选择本页"
                  className="accent-primary"
                  checked={records.length > 0 && records.every((r) => selected.has(r.submission_no))}
                  onChange={(e) =>
                    setSelected((prev) => {
                      const next = new Set(prev);
                      for (const r of records) {
                        if (e.target.checked) next.add(r.submission_no);
                        else next.delete(r.submission_no);
                      }
                      return next;
                    })
                  }
                />
              </th>
            )}
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
                  {showWho && (
                    <td className={TD} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`选择提交 ${r.submission_no.slice(0, 8)}`}
                        className="accent-primary"
                        checked={selected.has(r.submission_no)}
                        onChange={(e) =>
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(r.submission_no);
                            else next.delete(r.submission_no);
                            return next;
                          })
                        }
                      />
                    </td>
                  )}
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
                    <Verdict status={r.status} verdict={r.verdict} originalVerdict={r.original_verdict} />
                  </td>
                  {showScore && (
                    <td
                      className={cn(TD, "text-right font-mono", r.skipped && "text-slate-300 line-through")}
                      style={r.score != null && !r.skipped ? { color: scoreColor(r.score) } : undefined}
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
