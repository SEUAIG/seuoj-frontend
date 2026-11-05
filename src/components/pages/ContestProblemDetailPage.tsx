import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ContestProblemCoding from "@/components/bussiness/ContestProblemCoding";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useQueryToGetContestProblemDetail from "@/hooks/useQueryToGetContestProblemDetail";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
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
  const [hide, setHide] = useState(false);
  const [problemErrorCode, setProblemErrorCode] = useState<number | null>(null);
  const { language, codeFileObjectArray } = useSelector(
    (store: RootState) => store.contestCode
  );
  const nav = useNavigate();
  const { data, isLoading, isError, error } = useQueryToGetContestProblemDetail(
    contestId || 0,
    pidParam || ""
  );
  const { data: contestDetail } = useQueryToGetContestDetail(contestId || 0);
  const { data: standings } = useContestStandings(
    contestId,
    contestStatusOf(contestDetail) === "IN_PROGRESS"
  );
  const problems = sortProblems(contestDetail?.problem_list);
  const me = standings?.records.find((r) => isMine(r, user));
  const current = problems.find((p) => p.pid === pidParam);

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
    <nav className="sticky top-0 z-10 flex items-center gap-0.5 overflow-x-auto border-b bg-white/95 px-3 backdrop-blur-sm md:px-6">
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
    </nav>
  );

  const shell = (children: React.ReactNode) => (
    <ContestShell contestId={contestId} tab="problem" fill>
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
        <div className="h-full w-full border-t bg-gray-50">
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
    }
  };
  const hideToggle = (
    <div className="flex items-center gap-2">
      <Switch id="sethide-contest" checked={hide} onCheckedChange={setHide} />
      <Label htmlFor="sethide-contest" className="cursor-pointer whitespace-nowrap text-sm text-slate-500">
        隐藏编辑器
      </Label>
    </div>
  );
  return shell(
    <>
      <Helmet>
        <title>{`${letter}. ${title} - SEUOJ`}</title>
      </Helmet>
      <div className="relative flex h-full w-full max-w-full flex-col overflow-hidden border-t bg-white lg:flex-row">
        {hide ? (
          <div className="absolute right-4 top-2 z-20 bg-white/90 px-2 py-1.5 backdrop-blur-sm">{hideToggle}</div>
        ) : null}
        <div
          className={cn(
            hide ? "w-full" : "w-full lg:w-1/2",
            "h-full min-w-0 max-w-full flex-shrink overflow-y-auto overflow-x-hidden border-r"
          )}
        >
          {problemNav}
          <ContestProblemDetailInfo
            problem={{ ...problemData, pid: letter }}
            isAuthenticated={isAuthenticated}
          />
        </div>
        {hide ? null : (
          <div className="relative h-full w-full min-w-0 max-w-full flex-shrink overflow-y-auto overflow-x-hidden bg-gray-50 lg:w-1/2">
            {isAuthenticated ? (
              <ContestProblemCoding
                pid={pid}
                contest_id={contestId || 0}
                handleCodeSubmit={handleContestCodeSubmit}
                headerExtra={hideToggle}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <div className="space-y-4 p-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-700">需要登录</h3>
                  <p>请登录后查看代码编辑器并提交代码。</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
