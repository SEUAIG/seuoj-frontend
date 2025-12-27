import React, { useEffect, useState } from "react";
import SubmissionRecord from "../bussiness/SubmissionRecord";
import CodeShow from "../common/CodeShow";
import TestPoints from "../bussiness/TestPoints";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "@/services/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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
}
export interface ResultDetailItem {
  cnt: number;
  in: string;
  out: string;
  ans: string;
  sys: string;
  time: number;
  mem: number;
  type: string;
}

export interface SubmissionData {
  submissionNo: string; // 提交记录uuid
  pid: string;
  language: string;
  status: SubmissionStatus; // 提交生命周期状态
  verdict: SubmissionVerdict | null; // 评测未结束时候为null，为评测的最终判定结果
  resultDetail: ResultDetailItem[] | null; // 评测结束且verdict不为JudgeError、CompileError时不为空
  errorDetail: string | null; // 评测结束且verdict为JudgeError、CompileError时不为空
  submitTime: string; // 提交时间
  finishTime: string;
  message?: string;
  code: string; // 用户代码
  username: string; // 提交者用户名
}

export interface SubmissionResponse {
  code: number;
  message: string;
  data: SubmissionData;
}

// 参考http://eoj.seucpc.com/submission/63869
export default function SubmissionPage() {
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  // 获取查询参数 使用数组进行解构 因为他返回了一个长度为2的数组 但本身是一个对象
  // 这不是一个普通对象 不能直接获取值 而是一个实例 使用get
  const { submissionNo } = useParams();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchSubmission = async () => {
      if (!submissionNo) return;
      try {
        const res = await api.get<SubmissionResponse>(
          `/api/submission/${submissionNo}`
        );
        const result = res.data;
        const { code, message, data } = result;
        console.log(result);
        if (data) {
          setSubmission(data);
          setLoading(false);
          // 如果状态是 Pending 或 Running继续轮询
          if (
            data.status === SubmissionStatus.Pending ||
            data.status === SubmissionStatus.Running
          ) {
          } else {
            // 如果状态是 Finished 或 Failed 清除轮询
            if (intervalId) clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
        setLoading(false);
        // 出错时也清除轮询
        if (intervalId) clearInterval(intervalId);
      }
    };
    fetchSubmission();
    // 设置轮询，每1秒执行一次
    intervalId = setInterval(fetchSubmission, 1000);
    // 不需要传入 可以直接使用 内部函数闭包特性
    // 清理函数
    return () => {
      if (intervalId) clearInterval(intervalId);
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
  if (submission.status === SubmissionStatus.Failed) {
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
      <SubmissionRecord submission={submission} title={title} />
      <CodeShow>{submission.code}</CodeShow>
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
          <TestPoints resultDetail={submission.resultDetail} />
        )}
    </div>
  );
}
