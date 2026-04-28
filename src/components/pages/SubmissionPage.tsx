import React, { useEffect, useState } from "react";
import SubmissionRecord from "../bussiness/SubmissionRecord";
import CodeShow from "../common/CodeShow";
import TestPoints from "../bussiness/TestPoints";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { ResultDetailItem, SubmissionData, SubtaskItem } from "@/models/submission";
import { getSubmissionDetail } from "@/services/Submission/getSubmissionDetail";
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
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  const nav = useNavigate();
  const from = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  // 获取查询参数 使用数组进行解构 因为他返回了一个长度为2的数组 但本身是一个对象
  // 这不是一个普通对象 不能直接获取值 而是一个实例 使用get
  const { submissionNo } = useParams();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const fetchSubmission = async () => {
      if (!submissionNo) return;
      try {
        const result = await getSubmissionDetail(submissionNo);
        const { code, message, data } = result;
        console.log("Submission data:", result);
        if (data) {
          setSubmission(data);
          setLoading(false);
          // 如果状态是 Finished 或 Failed，停止轮询
          if (
            data.status === SubmissionStatus.Finished ||
            data.status === SubmissionStatus.Failed
          ) {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
        setLoading(false);
        // 出错时停止轮询
        setIsPolling(false);
      }
    };
    // 立即执行一次
    fetchSubmission();
    // 只有在 isPolling 为 true 时才设置轮询
    if (isPolling) {
      intervalId = setInterval(fetchSubmission, 1000);
    }
    // 清理函数：组件卸载或依赖变化时清除定时器
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [submissionNo, isPolling]);

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
  if (submission.status === SubmissionStatus.Pending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 w-full max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-full p-8 animate-pulse">
          <Clock className="w-16 h-16 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-yellow-700">排队中</h2>
        <p className="text-gray-500 text-lg">您的提交正在等待评测...</p>
        <div className="w-full max-w-md bg-yellow-100 h-2 rounded-full overflow-hidden">
          <div className="bg-yellow-500 h-full w-1/2 animate-indeterminate-progress"></div>
        </div>
      </div>
    );
  }
  if (submission.status === SubmissionStatus.Running) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 w-full max-w-4xl mx-auto p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-full p-8">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-3xl font-bold text-blue-700">评测中</h2>
        <p className="text-gray-500 text-lg">正在评测您的提交...</p>
        <div className="w-full max-w-md bg-blue-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-2/3 animate-indeterminate-progress"></div>
          {/* 现在这是一个定死的进度条 后续会具有欺骗性 */}
        </div>
      </div>
    );
  }
  if (
    submission.status === SubmissionStatus.Failed &&
    submission.verdict === SubmissionVerdict.SystemError
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 w-full max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-full p-8">
          <AlertCircle className="w-16 h-16 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-red-700">系统错误</h2>
        <p className="text-gray-500 text-lg">评测系统发生错误。</p>
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误详情</AlertTitle>
          <AlertDescription>
            {submission.message || "发生了未知错误。"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  // Finished 状态
  return (
    <div className="flex flex-col pb-6 p-2 mx-auto w-4/5">
      <div className="flex justify-end mb-4 space-x-4">
        <Button
          variant="outline"
          onClick={() => nav(`/problemsLibrary/${submission.pid}?from=${from}`)}
        >
          返回题目
        </Button>
        <Button variant="default" onClick={() => nav(`/evaluation`)}>
          返回评测
        </Button>
      </div>
      <SubmissionRecord submission={submission} title={title} />
      {submission.code && (
        <CodeShow language={submission.language}>{submission.code}</CodeShow>
      )}
      {(submission.verdict === "CompileError" ||
        submission.verdict === "JudgeError") && (
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
          />
        )}
    </div>
  );
}
