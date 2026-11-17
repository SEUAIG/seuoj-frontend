import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SubmitPanel from "@/components/bussiness/SubmitPanel";
import { setContestCodeFile, setContestLanguage } from "@/features/Code/contestCodeSlice";
import useQueryToGetContestProblemDetail from "@/hooks/useQueryToGetContestProblemDetail";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import useCommentSummary from "@/hooks/useCommentSummary";
import type { ProblemData } from "@/models/problem";
import ContestProblemDetailInfo from "@/components/bussiness/ContestProblemDetailInfo";
import { submitContestSolution } from "@/services/Contest/submitContestSolution";
import ProblemAccessState from "@/components/common/ProblemAccessState";
import ContestShell, { rememberProblem } from "@/components/contest/ContestShell";
import {
  STATE_TEXT,
  cellStateOf,
  contestStatusOf,
  isMine,
  letterOf,
  sortProblems,
  useContestStandings,
  useCurrentUser,
} from "@/components/contest/contestKit";
import { cn } from "@/lib/utils";

export default function ContestProblemDetailPage() {
  const { isAuthenticated } = useSelector((store: RootState) => store.auth);
  const user = useCurrentUser();
  const { id, pid: pidParam } = useParams();
  const contestId = Number(id);
  const [submitting, setSubmitting] = useState(false);
  const [problemErrorCode, setProblemErrorCode] = useState<number | null>(null);
  const { language, codeFileObjectArray } = useSelector(
    (store: RootState) => store.contestCode
  );
  const nav = useNavigate();
  const dispatch = useDispatch();
  const changeLanguage = useCallback((value: string) => dispatch(setContestLanguage(value)), [dispatch]);
  const { data, isLoading, isError, error } = useQueryToGetContestProblemDetail(
    contestId || 0,
    pidParam || ""
  );
  const { data: contestDetail } = useQueryToGetContestDetail(contestId || 0);
  const { data: standings } = useContestStandings(contestId, contestDetail, false);
  const problems = sortProblems(contestDetail?.problem_list);
  const me = standings?.records.find((r) => isMine(r, user));
  const current = problems.find((p) => p.pid === pidParam);
  // 讨论入口：开关打开且比赛结束后才对选手出现；管理者随时可见
  const discussionOpen =
    !!contestDetail?.discussion_enabled &&
    (!!contestDetail.can_write || contestStatusOf(contestDetail) === "FINISHED");
  const { data: discussion } = useCommentSummary(
    { target_type: "PROBLEM", pid: pidParam ?? "", contest_id: contestId },
    discussionOpen && !!pidParam
  );

  useEffect(() => {
    if (contestId && pidParam) rememberProblem(contestId, pidParam);
  }, [contestId, pidParam]);

  useEffect(() => {
    if (!isError || !error) {
      setProblemErrorCode(null);
      return;
    }
    const maybeCode = Number((error as Error & { code?: number }).code);
    if (!Number.isNaN(maybeCode)) {
      setProblemErrorCode(maybeCode);
    }
  }, [isError, error]);

  /** 题号导航：字母按我的结果着色，当前题加下划线 */
  const problemNav = (
    <nav className="-mt-4 flex items-center gap-0.5 overflow-x-auto border-b">
      {problems.map((p) => {
        const state = cellStateOf(me?.score_details?.[p.pid], standings?.rule_type);
        const on = p.pid === pidParam;
        return (
          <Link
            key={p.pid}
            to={`/contest/${contestId}/${p.pid}`}
            title={p.title}
            className={cn(
              "-mb-px border-b-2 border-transparent px-3 pb-2.5 pt-2 font-display text-base font-semibold",
              state ? STATE_TEXT[state] : "text-slate-400 hover:text-slate-900",
              on && "border-current",
              on && !state && "text-slate-900"
            )}
          >
            {letterOf(p.sort_order)}
          </Link>
        );
      })}
      {discussionOpen && discussion?.can_view && (
        <Link
          to={`/contest/${contestId}/${pidParam}/discussion`}
          aria-label={`讨论 ${discussion.comment_count} 条`}
          className="ml-auto shrink-0 rounded px-2 pb-2.5 pt-2 text-sm text-slate-600 hover:text-slate-900"
        >
          💭 讨论 {discussion.comment_count}
        </Link>
      )}
    </nav>
  );

  const shell = (children: React.ReactNode) => (
    <ContestShell contestId={contestId} tab="problem">
      {children}
    </ContestShell>
  );

  if (isLoading) {
    return shell(
      <div className="flex h-full justify-center pt-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }
  if (isError || !data) {
    const isKnown404 = problemErrorCode === 40401 || problemErrorCode === 40402;
    if (isKnown404) {
      return shell(
        <div className="min-h-[50vh] w-full">
          <ProblemAccessState code={problemErrorCode} />
        </div>
      );
    }
    return shell(
      <div className="pt-24 text-center text-slate-500">
        <div className="mb-2 text-lg font-semibold text-slate-700">加载题目失败</div>
        <p>{error instanceof Error ? error.message : "未知错误"}</p>
      </div>
    );
  }
  const problemData: ProblemData = {
    pid: data.pid,
    title: data.title,
    content: data.content,
    tags: [],
    totalSubmit: 0,
    totalAccept: 0,
  };
  const { title, pid } = problemData;
  const letter = current ? letterOf(current.sort_order) : pid;
  const handleContestCodeSubmit = async () => {
    const index = codeFileObjectArray.findIndex(
      (i: { contest_id: number; pid: string }) =>
        i.contest_id === contestId && i.pid === pid
    );
    if (index === -1) {
      toast.error("代码不能为空");
      return;
    }
    const code = codeFileObjectArray[index].codeFile;
    if (!code || code.trim() === "") {
      toast.error("代码不能为空");
      return;
    }
    const payload = { pid, language, code };
    setSubmitting(true);
    try {
      const result = await submitContestSolution(contestId, payload);
      if (result.code === 0 || result.code === "0") {
        toast.success("提交成功");
        const submission_no = result.data?.submission_no;
        if (!submission_no) {
          toast.error("提交成功，但未返回提交编号");
          return;
        }
        nav(`/contest/${contestId}/submission/${submission_no}`);
      } else {
        toast.error(result.message || "提交失败");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };
  const draftCode =
    codeFileObjectArray.find(
      (item: { contest_id: number; pid: string }) => item.contest_id === contestId && item.pid === pid
    )?.codeFile ?? "";
  return shell(
    <>
      <Helmet>
        <title>{`${letter}. ${title} - SEUOJ`}</title>
      </Helmet>
      {problemNav}
      <ContestProblemDetailInfo problem={{ ...problemData, pid: letter }} isAuthenticated={isAuthenticated} />
      <div className="mx-auto max-w-[58rem] px-5 md:px-8">
        <SubmitPanel
          code={draftCode}
          onCodeChange={(codeFile) => dispatch(setContestCodeFile({ contest_id: contestId, pid, codeFile }))}
          language={language}
          onLanguageChange={changeLanguage}
          onSubmit={handleContestCodeSubmit}
          isAuthenticated={isAuthenticated}
          submitting={submitting}
        />
      </div>
    </>
  );
}
