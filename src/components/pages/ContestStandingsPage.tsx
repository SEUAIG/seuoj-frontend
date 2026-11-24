import SubmitterLink from "@/components/common/SubmitterLink";
import ClassPagination from "@/components/bussiness/ClassPagination";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import ContestShell from "@/components/contest/ContestShell";
import {
  displayName,
  hm,
  isAcm,
  isMine,
  letterOf,
  problemStats,
  scoreColor,
  sortProblems,
  standingsBlockedReason,
  useContestStandings,
  useCurrentUser,
  type ProblemStat,
} from "@/components/contest/contestKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import type { ContestRuleType, ContestStandingsScoreDetail } from "@/models/contest";
import { cn } from "@/lib/utils";

const TD = "whitespace-nowrap border-b border-slate-100 px-2 py-[9px] text-center font-mono";
const TH = "whitespace-nowrap px-2 py-2.5 font-medium";
/** 能点进提交记录的格子 */
const GO = "cursor-pointer hover:bg-slate-100";
/** 默认每页显示选手数（支持任意正整数连续调节） */
const DEFAULT_PAGE_SIZE = 15;

interface CellProps {
  d?: ContestStandingsScoreDetail;
  st?: ProblemStat;
  rule?: ContestRuleType;
  /** 点击进入这个人这道题的提交；不能点时为空 */
  go?: () => void;
}

function AcmCell({ d, st, go }: CellProps) {
  if (!d) return <td className={TD} />;
  const n = d.unacceptedCount ?? 0;
  if (d.accepted) {
    const t = d.acceptedTime ?? 0;
    // 同一分钟内可能有多个 AC，只有提交 ID 与一血一致的那个才高亮
    const first =
      st?.firstAc != null &&
      d.acceptedTime === st.firstAc &&
      (st.firstJudgeId == null || Number(d.judge_id) === st.firstJudgeId);
    return (
      <td
        onClick={go}
        className={cn(TD, first && "bg-green-700 text-white", go && (first ? "cursor-pointer hover:bg-green-800" : GO))}
        title={`${first ? "本题第一个通过\n" : ""}${hm(t)} 通过${n ? `，此前错 ${n} 次` : ""}`}
      >
        <b className={cn("block text-sm leading-tight", first ? "font-bold" : "font-semibold text-green-700")}>
          +{n || ""}
        </b>
        <i className={cn("block text-[11px] not-italic leading-tight", first ? "text-green-100" : "text-slate-400")}>
          {hm(t)}
        </i>
      </td>
    );
  }
  return (
    <td onClick={go} className={cn(TD, go && GO)} title={n ? `错 ${n} 次` : "没有计罚时的提交"}>
      {n ? (
        <b className="text-sm font-semibold text-red-600">−{n}</b>
      ) : (
        <b className="text-sm font-normal text-slate-400">−</b>
      )}
    </td>
  );
}

function ScoreCell({ d, go }: CellProps) {
  if (!d || d.score == null) return <td className={TD} />;
  return (
    <td onClick={go} className={cn(TD, go && GO)}>
      <span className="font-semibold" style={{ color: scoreColor(d.score) }}>
        {d.score}
      </span>
    </td>
  );
}

function Cell(props: CellProps) {
  return isAcm(props.rule) ? <AcmCell {...props} /> : <ScoreCell {...props} />;
}

export default function ContestStandingsPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const nav = useNavigate();
  const user = useCurrentUser();
  const { data: detail } = useQueryToGetContestDetail(contestId || 0);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const blocked = standingsBlockedReason(detail, isAuthenticated);
  const { data, isLoading, isError, error } = useContestStandings(contestId, detail);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pageSizeInput, setPageSizeInput] = useState<string>(String(DEFAULT_PAGE_SIZE));

  const rule = data?.rule_type ?? detail?.rule_type;
  const acm = isAcm(rule);
  const problems = sortProblems(data?.problems?.length ? data.problems : detail?.problem_list);
  const records = data?.records ?? [];
  const stats = problemStats(data);
  const statCols = acm ? 2 : 1;
  const canManage = !!detail?.can_write;

  // 切换比赛时重置到第一页
  useEffect(() => {
    setPage(1);
  }, [contestId]);

  const totalRecords = records.length;
  const maxPageSize = Math.max(totalRecords, 1);
  const effectivePageSize = Math.min(Math.max(1, pageSize), maxPageSize);
  const totalPages = Math.max(1, Math.ceil(totalRecords / effectivePageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const applyPageSize = (raw: number) => {
    const clamped = Math.min(Math.max(1, Math.floor(raw)), maxPageSize);
    setPageSize(clamped);
    setPageSizeInput(String(clamped));
    setPage(1);
  };

  const startIdx = (safePage - 1) * effectivePageSize;
  const endIdx = Math.min(startIdx + effectivePageSize, totalRecords);
  const visibleRecords = records.slice(startIdx, endIdx);

  const myIndex = records.findIndex((r) => isMine(r, user));
  const myPage = myIndex >= 0 ? Math.floor(myIndex / effectivePageSize) + 1 : null;

  /** 进入某人的提交记录：管理者可以看任何人，选手只能看自己 */
  const submissionsOf = (username: string, mine: boolean, pid?: string) => {
    if (!canManage && !mine) return undefined;
    const q = new URLSearchParams();
    if (canManage) q.set("user", username);
    if (pid) q.set("pid", pid);
    return () => nav(`/contest/${contestId}/submissions${q.toString() ? `?${q}` : ""}`);
  };

  return (
    <ContestShell contestId={contestId} tab="standings">
      <Helmet>
        <title>{detail?.title ? `排名 - ${detail.title} - SEUOJ` : "排名 - SEUOJ"}</title>
      </Helmet>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[26px] font-semibold">排名</h2>
        {!blocked && detail && !isLoading && !(isError && !data) && totalRecords > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>
              第 {startIdx + 1}–{endIdx} 名，共 {totalRecords} 名选手
            </span>
            {myPage != null && myPage !== safePage && (
              <button
                type="button"
                onClick={() => setPage(myPage)}
                className="rounded border border-primary/30 bg-primary/5 px-2 py-1 font-medium text-primary hover:bg-primary/10"
              >
                定位到我（第 {myPage} 页）
              </button>
            )}
            <label className="inline-flex items-center gap-1.5">
              <span>每页</span>
              {totalRecords > 1 && (
                <input
                  type="range"
                  min={1}
                  max={maxPageSize}
                  value={effectivePageSize}
                  onChange={(e) => applyPageSize(Number(e.target.value))}
                  aria-label="每页显示选手数"
                  className="hidden h-1.5 w-24 cursor-pointer accent-primary sm:inline-block"
                />
              )}
              <input
                type="number"
                min={1}
                max={maxPageSize}
                value={pageSizeInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageSizeInput(val);
                  const parsed = Number.parseInt(val, 10);
                  if (Number.isFinite(parsed) && parsed >= 1) {
                    setPageSize(Math.min(parsed, maxPageSize));
                    setPage(1);
                  }
                }}
                onBlur={() => setPageSizeInput(String(effectivePageSize))}
                className="w-16 rounded border border-slate-200 bg-white px-2 py-1 text-center font-mono text-xs text-slate-700 focus:border-primary focus:outline-none"
              />
              <span>名</span>
            </label>
          </div>
        )}
      </div>

      {blocked ? (
        <p className="py-24 text-center text-slate-500">{blocked}</p>
      ) : !detail || isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : isError && !data ? (
        <p className="py-24 text-center text-slate-500">
          {error instanceof Error ? error.message : "排名暂不可见"}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className={cn(TH, "sticky left-0 z-20 w-12 min-w-[48px] bg-white text-right")}>#</th>
                  <th
                    className={cn(
                      TH,
                      "sticky left-12 z-20 min-w-[140px] border-r border-slate-200/80 bg-white text-left"
                    )}
                  >
                    选手
                  </th>
                  {acm ? (
                    <>
                      <th className={TH}>通过</th>
                      <th className={TH}>罚时</th>
                    </>
                  ) : (
                    <th className={TH}>总分</th>
                  )}
                  {problems.map((p) => (
                    <th key={p.pid} className={cn(TH, "min-w-[64px] text-center")}>
                      <Link
                        to={`/contest/${contestId}/${p.pid}`}
                        title={`${letterOf(p.sort_order)}. ${p.title}`}
                        className="font-display text-[15px] font-semibold text-slate-900 hover:text-primary"
                      >
                        {letterOf(p.sort_order)}
                      </Link>
                    </th>
                  ))}
                </tr>
                {/* 每题统计放在所有人上面 */}
                <tr className={cn("text-xs text-slate-500", !acm && "border-b border-slate-900")}>
                  <td className="sticky left-0 z-20 bg-white" />
                  <td className="sticky left-12 z-20 border-r border-slate-200/80 bg-white px-2 py-2 text-left">
                    通过 / 尝试
                  </td>
                  <td colSpan={statCols} />
                  {problems.map((p) => (
                    <td key={p.pid} className="whitespace-nowrap px-2 py-2 text-center font-mono">
                      {stats[p.pid]?.solvers ?? 0} / {stats[p.pid]?.tried ?? 0}
                    </td>
                  ))}
                </tr>
                {acm && (
                  <tr className="border-b border-slate-900 text-xs text-slate-500">
                    <td className="sticky left-0 z-20 bg-white" />
                    <td className="sticky left-12 z-20 border-r border-slate-200/80 bg-white px-2 pb-2.5 text-left align-top">
                      第一个通过
                    </td>
                    <td colSpan={statCols} />
                    {problems.map((p) => {
                      const st = stats[p.pid];
                      const who = st?.firstBy.join("、");
                      return (
                        <td key={p.pid} className="px-2 pb-2.5 text-center align-top" title={who}>
                          {st?.firstAc != null ? (
                            <>
                              <span className="block font-mono">{hm(st.firstAc)}</span>
                              <span className="mx-auto block max-w-[6rem] truncate text-[11px] text-green-800">{who}</span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </thead>
              <tbody>
                {visibleRecords.map((r) => {
                  const mine = isMine(r, user);
                  const name = displayName(r);
                  const goAll = submissionsOf(r.username, mine);
                  const stickyBg = mine ? "bg-sky-50" : "bg-white group-hover:bg-slate-50";
                  return (
                    <tr
                      key={r.user_id ?? r.username}
                      className={cn("group", mine ? "bg-sky-50" : "hover:bg-slate-50")}
                    >
                      <td className={cn(TD, "sticky left-0 z-10 w-12 min-w-[48px] text-right text-slate-500", stickyBg)}>
                        {r.is_starred || r.rank == null ? <span title="打星，不占正式名次">*</span> : r.rank}
                      </td>
                      <td
                        className={cn(
                          TD,
                          "sticky left-12 z-10 min-w-[140px] border-r border-slate-200/80 text-left font-sans",
                          stickyBg,
                          mine && "font-semibold text-primary shadow-[inset_3px_0_hsl(var(--primary))]",
                          r.is_starred && !mine && "text-slate-500"
                        )}
                      >
                        <SubmitterLink
                          username={r.username}
                          nickname={name}
                          userId={r.user_id}
                          className="text-inherit hover:underline"
                        />
                        {name !== r.username && (
                          <small className="ml-2 hidden font-mono text-[11px] font-normal text-slate-400 sm:inline">
                            {r.username}
                          </small>
                        )}
                      </td>
                      {acm ? (
                        <>
                          <td onClick={goAll} className={cn(TD, "font-semibold", goAll && GO)} title={goAll && "查看提交"}>
                            {r.score}
                          </td>
                          <td onClick={goAll} className={cn(TD, "text-slate-500", goAll && GO)} title={goAll && "查看提交"}>
                            {r.penalty ?? 0}
                          </td>
                        </>
                      ) : (
                        <td onClick={goAll} className={cn(TD, "font-semibold", goAll && GO)} title={goAll && "查看提交"}>
                          {r.score}
                        </td>
                      )}
                      {problems.map((p) => {
                        const d = r.score_details?.[p.pid];
                        return (
                          <Cell
                            key={p.pid}
                            d={d}
                            st={stats[p.pid]}
                            rule={rule}
                            go={d ? submissionsOf(r.username, mine, p.pid) : undefined}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={2 + statCols + problems.length} className="py-16 text-center text-slate-400">
                      —
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <ClassPagination
              totalPages={totalPages}
              currentPage={safePage}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          )}
        </>
      )}
    </ContestShell>
  );
}

