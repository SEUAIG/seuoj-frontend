import { useEffect, useState } from "react";
import SubmissionRecord from "../bussiness/SubmissionRecord";
import CodeShow from "../common/CodeShow";
import TestPoints from "../bussiness/TestPoints";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { SubmissionData } from "@/models/submission";
import { getSubmissionDetail } from "@/services/Submission/getSubmissionDetail";
import { getProblemDetail } from "@/services/Problem/getProblemDetail";
import { useQuery } from "@tanstack/react-query";

import { problemContext, problemPath } from "@/lib/problemNavigation";

const FOREGROUND_POLL_INTERVAL = 1000;
const BACKGROUND_POLL_INTERVAL = 5000;

export enum SubmissionStatus {
  Pending = "Pending", // 还没有发送给评测端
  Running = "Running", // 成功发送给评测端，正在判题
  Failed = "Failed", // 评测端错误
  Finished = "Finished", // 评测结束
  // 左侧是标识符 右侧是值
}
export enum SubmissionVerdict {
  CompileError = "CompileError", // 具体信息看errorDetail
  JudgeError = "JudgeError", // 具体信息看errorDetail
  Accepted = "Accepted",
  WrongAnswer = "WrongAnswer",
  TimeLimitExceeded = "TimeLimitExceeded",
  MemoryLimitExceeded = "MemoryLimitExceeded",
  RuntimeError = "RuntimeError",
  SystemError = "SystemError",
  PartiallyAccepted = "PartiallyAccepted",
  Skipped = "Skipped",
}
// 参考http://eoj.seucpc.com/submission/63869
export default function SubmissionPage() {
  const nav = useNavigate();
  const from = `${window.location.pathname}${window.location.search}`;
  const [searchParams] = useSearchParams();
  const { submissionNo } = useParams();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);

  const context = problemContext(searchParams);
  if (submission?.contestId != null) context.contest_id = String(submission.contestId);
  if (submission?.assignmentId != null) {
    context.assignment_id = String(submission.assignmentId);
  }
  const { data: problemData } = useQuery({
    queryKey: ["problemTitle", submission?.pid, context],
    queryFn: () => getProblemDetail(submission!.pid, context),
    enabled: !!submission?.pid,
    staleTime: 5 * 60 * 1000,
  });
  const title = problemData?.data?.title ?? null;

  useEffect(() => {
    setSubmission(null);
    setLoading(true);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const getNextDelay = () =>
      document.visibilityState === "hidden"
        ? BACKGROUND_POLL_INTERVAL
        : FOREGROUND_POLL_INTERVAL;

    const fetchSubmission = async () => {
      if (!submissionNo || cancelled) return;
      try {
        const result = await getSubmissionDetail(submissionNo);
        const { data } = result;
        if (cancelled) return;
        setLoading(false);
        if (result.code === 0 && data) {
          setSubmission(data);
          const shouldContinuePolling = !(
            data.status === SubmissionStatus.Finished ||
            data.status === SubmissionStatus.Failed
          );
          if (shouldContinuePolling) {
            timeoutId = setTimeout(fetchSubmission, getNextDelay());
          }
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
        if (cancelled) return;
        setLoading(false);
      }
    };

    fetchSubmission();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [submissionNo]);

  if (loading && !submission) {
    return (
      <div className="flex flex-col pb-6 p-2 mx-auto w-4/5 space-y-4">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }
  if (!submission) {
    return (
      <div className="flex flex-col pb-6 p-2 mx-auto w-4/5">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>加载提交数据失败。</AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="flex flex-col pb-6 p-2 mx-auto w-4/5">
      <div className="flex justify-end mb-4 space-x-4">
        <Button
          variant="outline"
          onClick={() => nav(problemPath(submission.pid, context, from))}
        >
          返回题目
        </Button>
        <Button variant="default" onClick={() => nav(`/evaluation`)}>
          返回评测
        </Button>
      </div>
      <SubmissionRecord submission={submission} title={title} problemUrl={problemPath(submission.pid, context, from)} />
      {submission.code && (
        <CodeShow language={submission.language}>{submission.code}</CodeShow>
      )}
      {submission.errorDetail && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <h3 className="text-lg font-bold text-red-700 mb-2">
            {submission.verdict === "CompileError"
              ? "编译错误信息"
              : "评测错误信息"}
          </h3>
          <CodeShow>{submission.errorDetail || "无详细错误信息"}</CodeShow>
        </div>
      )}
      {submission.verdict !== "CompileError" &&
        submission.verdict !== "JudgeError" && (
          <TestPoints
            resultDetail={submission.resultDetail}
            subtasks={submission.subtasks}
            showData={submission.testDataVisible !== false}
          />
        )}
    </div>
  );
}
