import SubmitterLink from "@/components/common/SubmitterLink";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import ContestShell from "@/components/contest/ContestShell";
import {
  contestStatusOf,
  displayName,
  hm,
  isAcm,
  isMine,
  letterOf,
  problemStats,
  scoreColor,
  sortProblems,
  useContestStandings,
  useCurrentUser,
  type ProblemStat,
} from "@/components/contest/contestKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import type { ContestRuleType, ContestStandingsScoreDetail } from "@/models/contest";
import { cn } from "@/lib/utils";

const TD = "whitespace-nowrap border-b border-slate-100 px-2 py-[9px] text-center font-mono";

function AcmCell({ d, st }: { d?: ContestStandingsScoreDetail; st?: ProblemStat }) {
  if (!d) return <td className={TD} />;
  const n = d.unacceptedCount ?? 0;
  if (d.accepted) {
    const t = d.acceptedTime ?? 0;
    const first = st?.firstAc != null && d.acceptedTime === st.firstAc;
    return (
      <td className={TD}>
        <div
          className="leading-tight"
          title={`${first ? "本题第一个通过\n" : ""}${hm(t)} 通过${n ? `，此前错 ${n} 次` : ""}`}
        >
          <b className={cn("block text-sm", first ? "font-extrabold text-green-900" : "font-semibold text-green-700")}>
            +{n || ""}
          </b>
          <i className="block text-[11px] not-italic text-slate-400">{hm(t)}</i>
        </div>
      </td>
    );
  }
  if (n) {
    return (
      <td className={TD}>
        <b className="text-sm font-semibold text-red-600" title={`错 ${n} 次`}>
          −{n}
        </b>
      </td>
    );
  }
  return (
    <td className={TD}>
      <b className="text-sm font-normal text-slate-400" title="没有计罚时的提交">
        −
      </b>
    </td>
  );
}

function ScoreCell({ d }: { d?: ContestStandingsScoreDetail }) {
  if (!d || d.score == null) return <td className={TD} />;
  return (
    <td className={TD}>
      <span className="font-semibold" style={{ color: scoreColor(d.score) }}>
        {d.score}
      </span>
    </td>
  );
}

function Cell({ d, st, rule }: { d?: ContestStandingsScoreDetail; st?: ProblemStat; rule?: ContestRuleType }) {
  return isAcm(rule) ? <AcmCell d={d} st={st} /> : <ScoreCell d={d} />;
}

export default function ContestStandingsPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const user = useCurrentUser();
  const { data: detail } = useQueryToGetContestDetail(contestId || 0);
  const live = contestStatusOf(detail) === "IN_PROGRESS";
  const { data, isLoading, isError, error } = useContestStandings(contestId, live);

  const rule = data?.rule_type ?? detail?.rule_type;
  const acm = isAcm(rule);
  const problems = sortProblems(data?.problems?.length ? data.problems : detail?.problem_list);
  const records = data?.records ?? [];
  const stats = problemStats(data);
  const statCols = acm ? 2 : 1;

  return (
    <ContestShell contestId={contestId} tab="standings">
      <Helmet>
        <title>{detail?.title ? `排名 - ${detail.title} - SEUOJ` : "排名 - SEUOJ"}</title>
      </Helmet>
      <div className="mb-4 flex items-baseline gap-3.5">
        <h2 className="m-0 font-display text-[26px] font-semibold">排名</h2>
        <span className="text-[13px] text-slate-500">
          {rule} · {records.length} 人
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : isError ? (
        <p className="py-24 text-center text-slate-500">
          {error instanceof Error ? error.message : "排名暂不可见"}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-xs font-medium text-slate-500">
                <th className="whitespace-nowrap border-b border-slate-900 px-2 py-2.5 text-right font-medium">#</th>
                <th className="whitespace-nowrap border-b border-slate-900 px-2 py-2.5 text-left font-medium">选手</th>
                {acm ? (
                  <>
                    <th className="whitespace-nowrap border-b border-slate-900 px-2 py-2.5 font-medium">通过</th>
                    <th className="whitespace-nowrap border-b border-slate-900 px-2 py-2.5 font-medium">罚时</th>
                  </>
                ) : (
                  <th className="whitespace-nowrap border-b border-slate-900 px-2 py-2.5 font-medium">总分</th>
                )}
                {problems.map((p) => (
                  <th key={p.pid} className="min-w-[60px] whitespace-nowrap border-b border-slate-900 px-2 py-2.5 text-center">
                    <Link
                      to={`/contest/${contestId}/${p.pid}`}
                      title={`${letterOf(p.sort_order)}. ${p.title}`}
                      className="block font-display text-[15px] font-semibold text-slate-900 hover:text-primary"
                    >
                      {letterOf(p.sort_order)}
                    </Link>
                    <span className="font-mono text-[11px] font-normal text-slate-400">{stats[p.pid]?.solvers ?? 0}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const mine = isMine(r, user);
                const name = displayName(r);
                return (
                  <tr
                    key={r.user_id ?? r.username}
                    className={cn("group", mine ? "bg-primary/[0.07]" : "hover:bg-white")}
                  >
                    <td className={cn(TD, "w-10 text-right text-slate-500")}>
                      {r.is_starred || r.rank == null ? <span title="打星，不占正式名次">*</span> : r.rank}
                    </td>
                    <td
                      className={cn(
                        TD,
                        "w-full text-left font-sans",
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
                        <small className="ml-2 hidden font-mono text-[11px] font-normal text-slate-400 sm:inline">{r.username}</small>
                      )}
                    </td>
                    {acm ? (
                      <>
                        <td className={cn(TD, "font-semibold")}>{r.score}</td>
                        <td className={cn(TD, "text-slate-500")}>{r.penalty ?? 0}</td>
                      </>
                    ) : (
                      <td className={cn(TD, "font-semibold")}>{r.score}</td>
                    )}
                    {problems.map((p) => (
                      <Cell key={p.pid} d={r.score_details?.[p.pid]} st={stats[p.pid]} rule={rule} />
                    ))}
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
            {records.length > 0 && (
              <tfoot className="text-xs text-slate-500">
                <tr>
                  <td />
                  <td className="px-2 pt-3 text-right">通过 / 尝试</td>
                  <td colSpan={statCols} />
                  {problems.map((p) => (
                    <td key={p.pid} className="whitespace-nowrap px-2 pt-3 text-center font-mono">
                      {stats[p.pid]?.solvers ?? 0} / {stats[p.pid]?.tried ?? 0}
                    </td>
                  ))}
                </tr>
                {acm && (
                  <tr>
                    <td />
                    <td className="px-2 pt-1.5 text-right">第一个通过</td>
                    <td colSpan={statCols} />
                    {problems.map((p) => {
                      const t = stats[p.pid]?.firstAc;
                      return (
                        <td key={p.pid} className="whitespace-nowrap px-2 pt-1.5 text-center font-mono">
                          {t != null ? hm(t) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tfoot>
            )}
          </table>
        </div>
      )}
    </ContestShell>
  );
}
