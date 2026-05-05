import React, { useEffect, useRef, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ProblemDetailInfo from "@/components/bussiness/ProblemDetailInfo";
import ProblemCoding from "@/components/bussiness/ProblemCoding";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ProblemData } from "@/models/problem";
import { getProblemDetail } from "@/services/Problem/getProblemDetail";
import { submitSolution } from "@/services/Submission/submitSolution";
import type { CreateSubmissionRequest } from "@/models/submission";
import ProblemAccessState from "@/components/common/ProblemAccessState";
export default function ProblemDetailPage() {
  const { isAuthenticated } = useSelector((store: RootState) => store.auth);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemErrorCode, setProblemErrorCode] = useState<number | null>(null);
  const [hide, setHide] = useState(false);
  const promptedNoTestcasePidRef = useRef<string | null>(null);
  const { language, codeFileObjectArray } = useSelector(
    (store: RootState) => store.code
  );
  const nav = useNavigate();
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
    toast.warning("当前题目没有测试点，请点击“评测配置”上传压缩包并配置测试点");
  }, [problem, hasTestCases]);
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
      toast.error("当前题目没有测试点，请先在左侧点击“评测配置”完善测试数据");
      return;
    }
    const index = codeFileObjectArray.findIndex(
      (i: { pid: string }) => i.pid === pid
    );
    if (index === -1) return;
    const code = codeFileObjectArray[index].codeFile;
    const data: CreateSubmissionRequest = { pid, language, code };
    if (assignmentId) {
      data.assignment_id = Number(assignmentId);
    }
    const problemSetId = searchParams.get("problem_set_id");
    if (problemSetId) {
      data.problem_set_id = Number(problemSetId);
    }
    const result = await submitSolution(data);
    const submissionNo =
      result.data?.submissionNo || result.data?.submission_no;
    if (submissionNo) {
      nav(`/submission/${submissionNo}?title=${title}`);
    }
  };
  return (
    <>
      <Helmet>
        <title>{`#${id}. ${title} - SEUOJ`}</title>
      </Helmet>
      <div className="h-[calc(100vh-5.5rem)] w-full max-w-full overflow-x-hidden overflow-y-hidden flex flex-col lg:flex-row bg-white border-t border-gray-200 relative">
        {hide ? (
          <div className="absolute right-4 top-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-md border border-gray-200 shadow-sm">
            <Switch
              id="sethide-practice"
              checked={hide}
              onCheckedChange={setHide}
            />
            <Label
              htmlFor="sethide-practice"
              className="cursor-pointer text-sm"
            >
              隐藏编辑器
            </Label>
          </div>
        ) : null}
        <div
          className={`${
            hide ? "w-full" : "w-full lg:w-1/2"
          } h-full w-full max-w-full min-w-0 flex-shrink overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent border-r border-gray-200`}
        >
          <ProblemDetailInfo
            problem={problem}
            isAuthenticated={isAuthenticated}
          />
        </div>
        {hide ? null : (
          <div className="w-full lg:w-1/2 h-full max-w-full min-w-0 flex-shrink overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50 relative">
            {isAuthenticated ? (
              <ProblemCoding
                pid={pid}
                handleCodeSubmit={handleCodeSubmit}
                submitDisabled={!hasTestCases || isAssignmentClosed}
                submitDisabledReason={
                  isAssignmentClosed ? "作业已关闭，仅供查看" : undefined
                }
                headerExtra={
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1 bg-white">
                    <Switch
                      id="sethide-practice"
                      checked={hide}
                      onCheckedChange={setHide}
                    />
                    <Label
                      htmlFor="sethide-practice"
                      className="cursor-pointer text-sm whitespace-nowrap"
                    >
                      隐藏编辑器
                    </Label>
                  </div>
                }
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <div className="p-8 text-center space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                    需要登录
                  </h3>
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
