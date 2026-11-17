import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ProblemDetailInfo from "@/components/bussiness/ProblemDetailInfo";
import SubmitPanel from "@/components/bussiness/SubmitPanel";
import { setCodeFile, setLanguage } from "@/features/Code/codeSlice";
import { toast } from "sonner";
import type { ProblemData } from "@/models/problem";
import { getProblemDetail } from "@/services/Problem/getProblemDetail";
import { submitSolution } from "@/services/Submission/submitSolution";
import type { CreateSubmissionRequest } from "@/models/submission";
import ProblemAccessState from "@/components/common/ProblemAccessState";
import { isAxiosError } from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCommentSummary from "@/hooks/useCommentSummary";
export default function ProblemDetailPage() {
  const { isAuthenticated } = useSelector((store: RootState) => store.auth);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemErrorCode, setProblemErrorCode] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const promptedNoTestcasePidRef = useRef<string | null>(null);
  const prevPid = problem?.prev_pid ?? null;
  const nextPid = problem?.next_pid ?? null;
  const { language, codeFileObjectArray } = useSelector(
    (store: RootState) => store.code
  );
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { data: discussion } = useCommentSummary({ target_type: "PROBLEM", pid: id ?? "" }, !!id);
  const changeLanguage = useCallback((value: string) => dispatch(setLanguage(value)), [dispatch]);
  const hasTestCases = useMemo(() => {
    if (!problem) return true;
    const n = Number(problem.content?.info?.test_case_number ?? 0);
    return n > 0;
  }, [problem]);
  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      setLoadingProblem(true);
      setProblem(null);
      setProblemErrorCode(null);
      try {
        const contest_id = searchParams.get("contest_id");
        const problem_set_id = searchParams.get("problem_set_id");
        const assignment_id = searchParams.get("assignment_id");
        const result = await getProblemDetail(id, {
          contest_id: contest_id || undefined,
          problem_set_id: problem_set_id || undefined,
          assignment_id: assignment_id || undefined,
        });
        const code = Number(result.code);
        if (code === 0 && result.data) {
          setProblem(result.data);
          return;
        }
        setProblemErrorCode(code);
      } catch (error) {
        setProblemErrorCode(isAxiosError(error) ? error.response?.status ?? null : null);
      } finally {
        setLoadingProblem(false);
      }
    };
    fetchProblem();
  }, [id, searchParams]);
  useEffect(() => {
    if (!problem) return;
    if (hasTestCases) return;
    if (!problem.can_write) return;
    if (promptedNoTestcasePidRef.current === problem.pid) return;
    promptedNoTestcasePidRef.current = problem.pid;
    toast.warning('当前题目没有测试点，请点击"评测配置"上传压缩包并配置测试点');
  }, [problem, hasTestCases]);

  const navigateToProblem = useCallback((targetPid: string | null) => {
    if (!targetPid) return;
    const params = new URLSearchParams(searchParams);
    const qs = params.toString();
    nav(`/problemsLibrary/${targetPid}${qs ? `?${qs}` : ""}`);
  }, [nav, searchParams]);
  if (loadingProblem) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 pb-10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-10 text-gray-400 font-mono text-sm">
            <span className="mr-2">&gt;</span>
            <span>Fetching problem data...</span>
            <span className="animate-ping ml-1 h-2 w-2 bg-indigo-500 rounded-full inline-block"></span>
          </div>
        </div>
      </div>
    );
  }
  if (!problem) {
    return (
      <div className="h-[calc(100vh-5.5rem)] w-full border-t border-gray-200 bg-gray-50">
        <ProblemAccessState code={problemErrorCode} />
      </div>
    );
  }
  const { title, pid } = problem;
  const assignmentId = searchParams.get("assignment_id");
  const isAssignmentClosed = !!assignmentId && problem.submittable === false;
  const handleCodeSubmit = async () => {
    if (isAssignmentClosed) {
      toast.error("作业已关闭，不可提交");
      return;
    }
    if (!hasTestCases) {
      toast.error('当前题目没有测试点，请先在左侧点击"评测配置"完善测试数据');
      return;
    }
    const draft = codeFileObjectArray.find((item: { pid: string }) => item.pid === pid);
    if (!draft || !draft.codeFile.trim()) {
      toast.error("提交代码不能为空");
      return;
    }
    const code = draft.codeFile;
    const data: CreateSubmissionRequest = { pid, language, code };
    if (assignmentId) {
      data.assignment_id = Number(assignmentId);
    }
    const problemSetId = searchParams.get("problem_set_id");
    if (problemSetId) {
      data.problem_set_id = Number(problemSetId);
    }
    setSubmitting(true);
    try {
      const result = await submitSolution(data);
      if (result.code !== 0) throw new Error(result.message);
      const submissionNo = result.data.submissionNo || result.data.submission_no;
      if (!submissionNo) throw new Error("提交响应缺少编号");
      nav(`/submission/${submissionNo}?${searchParams}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };
  const draftCode = codeFileObjectArray.find((item: { pid: string }) => item.pid === pid)?.codeFile ?? "";
  return (
    <>
      <Helmet>
        <title>{`#${id}. ${title} - SEUOJ`}</title>
      </Helmet>
      <div className="w-full border-t border-gray-200 bg-white">
        <div className="sticky top-14 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-2 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            disabled={!prevPid}
            onClick={() => navigateToProblem(prevPid)}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            上一题
          </Button>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">{pid}</span>
            {discussion?.can_view && (
              <Link
                to={`/problemsLibrary/${pid}/discussion`}
                aria-label={`讨论 ${discussion.comment_count} 条`}
                className="rounded px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                💭 讨论 {discussion.comment_count}
              </Link>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={!nextPid}
            onClick={() => navigateToProblem(nextPid)}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30"
          >
            下一题
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <ProblemDetailInfo problem={problem} isAuthenticated={isAuthenticated} />
        <div className="mx-auto max-w-[58rem] px-5 pb-16 md:px-8">
          <SubmitPanel
            code={draftCode}
            onCodeChange={(codeFile) => dispatch(setCodeFile({ pid, codeFile }))}
            language={language}
            onLanguageChange={changeLanguage}
            onSubmit={handleCodeSubmit}
            isAuthenticated={isAuthenticated}
            submitting={submitting}
            disabledReason={
              isAssignmentClosed ? "作业已关闭，仅供查看" : !hasTestCases ? "这道题还没有测试数据" : undefined
            }
          />
        </div>
      </div>
    </>
  );
}
