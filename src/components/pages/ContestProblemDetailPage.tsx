import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ContestProblemCoding from "@/components/bussiness/ContestProblemCoding";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useQueryToGetContestProblemDetail from "@/hooks/useQueryToGetContestProblemDetail";
import type { ProblemData } from "@/models/problem";
import { toast } from "sonner";
import ContestProblemDetailInfo from "@/components/bussiness/ContestProblemDetailInfo";
import { submitContestSolution } from "@/services/Contest/submitContestSolution";
import ProblemAccessState from "@/components/common/ProblemAccessState";
export default function ContestProblemDetailPage() {
  const { isAuthenticated } = useSelector((store: RootState) => store.auth);
  const { id, pid: pidParam } = useParams();
  const contestId = Number(id);
  const [hide, setHide] = useState(false);
  const [codeFile, setCodeFile] = useState("");
  const [problemErrorCode, setProblemErrorCode] = useState<number | null>(null);
  const { language, codeFileObjectArray } = useSelector(
    (store: RootState) => store.contestCode
  );
  const nav = useNavigate();
  const { data, isLoading, isError, error } = useQueryToGetContestProblemDetail(
    contestId || 0,
    pidParam || ""
  );

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
  if (isLoading) {
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
  if (isError || !data) {
    const isKnown404 = problemErrorCode === 40401 || problemErrorCode === 40402;
    if (isKnown404) {
      return (
        <div className="h-[calc(100vh-5.5rem)] w-full border-t border-gray-200 bg-gray-50">
          <ProblemAccessState code={problemErrorCode} />
        </div>
      );
    }
    return (
      <div className="w-4/5 mx-auto py-6 text-center text-muted-foreground">
        <div className="text-xl font-semibold mb-2">加载题目失败</div>
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
    const data = { pid, language, code };
    try {
      const result = await submitContestSolution(contestId, data);
      if (result.code === 0 || result.code === "0") {
        toast.success("提交成功");
        const submission_no = result.data?.submission_no;
        if (!submission_no) {
          toast.error("提交成功，但未返回提交编号");
          return;
        }
        nav(
            `/contest/${contestId}/submission/${submission_no}?title=${title}`
          );
        
      } 
      else {
        toast.error(result.message || "提交失败");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "提交失败，请稍后重试"
      );
    }
  };
  return (
    <>
      <Helmet>
        <title>{`${pid}. ${title} - SEUOJ`}</title>
      </Helmet>
      <div className="h-[calc(100vh-5.5rem)] w-full max-w-full overflow-x-hidden overflow-y-hidden flex flex-col lg:flex-row bg-white border-t border-gray-200 relative">
        {hide ? (
          <div className="absolute right-4 top-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-md border border-gray-200 shadow-sm">
            <Switch id="sethide-contest" checked={hide} onCheckedChange={setHide} />
            <Label htmlFor="sethide-contest" className="cursor-pointer text-sm">
              隐藏编辑器
            </Label>
          </div>
        ) : null}
        <div
          className={`${
            hide ? "w-full" : "w-full lg:w-1/2"
          } h-full w-full max-w-full min-w-0 flex-shrink overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent border-r border-gray-200`}
        >
          <ContestProblemDetailInfo
            problem={problemData}
            isAuthenticated={isAuthenticated}
          />
        </div>
        {hide ? null : (
          <div className="w-full lg:w-1/2 h-full max-w-full min-w-0 flex-shrink overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50 relative">
            {isAuthenticated ? (
              <ContestProblemCoding
                pid={pid}
                contest_id={contestId || 0}
                setCodeFile={setCodeFile}
                handleCodeSubmit={handleContestCodeSubmit}
                headerExtra={
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1 bg-white">
                    <Switch id="sethide-contest" checked={hide} onCheckedChange={setHide} />
                    <Label htmlFor="sethide-contest" className="cursor-pointer text-sm whitespace-nowrap">
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
