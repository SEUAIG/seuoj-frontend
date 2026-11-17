import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import ContestShell from "@/components/contest/ContestShell";
import CommentThread from "@/components/discussion/CommentThread";
import { letterOf, sortProblems } from "@/components/contest/contestKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";

/** 比赛入口的题目讨论页 /contest/:id/:pid/discussion；和题库入口是同一个 thread */
export default function ContestProblemDiscussionPage() {
  const { id, pid = "" } = useParams();
  const contestId = Number(id);
  const { data: contest } = useQueryToGetContestDetail(contestId || 0);
  const problem = sortProblems(contest?.problem_list).find((p) => p.pid === pid);
  const name = problem ? `${letterOf(problem.sort_order)}. ${problem.title}` : pid;

  return (
    <ContestShell contestId={contestId} tab="discussion">
      <Helmet>
        <title>{`讨论 · ${name} - SEUOJ`}</title>
      </Helmet>
      <div className="max-w-4xl space-y-6">
        <div className="space-y-1">
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to={`/contest/${contestId}/${pid}`} className="inline-flex items-center hover:text-slate-900">
              <ChevronLeft className="h-3.5 w-3.5" />
              返回题目
            </Link>
            <Link to={`/contest/${contestId}/discussion`} className="hover:text-slate-900">
              整场讨论
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            💭 讨论 <span className="font-normal text-slate-500">· {name}</span>
          </h1>
        </div>
        <CommentThread
          mode={{ kind: "thread", target: { target_type: "PROBLEM", pid, contest_id: contestId } }}
          contestId={contestId}
        />
      </div>
    </ContestShell>
  );
}
