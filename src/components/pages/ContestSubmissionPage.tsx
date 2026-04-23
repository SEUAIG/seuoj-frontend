import React, { useEffect, useState } from "react";
import ContestSubmissionRecord from "../bussiness/ContestSubmissionRecord";
import CodeShow from "../common/CodeShow";
import ContestTestPoints from "../bussiness/ContestTestPoints";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api/axios";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  SubmissionStatus,
  SubmissionVerdict,
  ResultDetailItem,
  SubmissionData,
} from "./SubmissionPage";
import { ContestSubmissionDetailResponse } from "@/services/Contest/getContestSubmissionDetail";
export default function ContestSubmissionPage() {
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  const { id, submission_no } = useParams();
  const contestId = Number(id);
  const nav = useNavigate();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const fetchSubmission = async () => {
      if (!contestId || !submission_no) return;
      try {
        const res = await api.get<ContestSubmissionDetailResponse>(
          `/api/contest/${contestId}/submission/${submission_no}`
        );
        const result = res.data;
        const { code, message, data } = result;
        if (data) {
          // 转换 API 返回的数据格式为 SubmissionData 格式，以便复用组件
          const submissionData: SubmissionData = {
            submissionNo: data.submission_no,
            pid: data.problem.pid, // 使用 problem 对象中的 pid
            language: data.language || "Unknown",
            status: data.status as SubmissionStatus,
            verdict: data.verdict as SubmissionVerdict | null,
            resultDetail: data.result_detail
              ? data.result_detail.map((item: any) => ({
                  ...item,
                  in: item.in || "",
                  out: item.out || "",
                  ans: item.ans || "",
                  sys: item.sys || "",
                }))
              : data.result_detail,
            errorDetail: data.error_detail,
            submitTime: data.submit_time,
            finishTime: "", // API 中未提供 finish_time，设为空字符串或根据需要处理
            code: data.code || "",
            username: data.username,
            score: data.score ?? undefined, // 比赛特有的分数
          };
          setSubmission(submissionData);
          setLoading(false);
          if (
            submissionData.status === SubmissionStatus.Finished ||
            submissionData.status === SubmissionStatus.Failed
          ) {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("Error fetching contest submission:", error);
        setLoading(false);
        setIsPolling(false);
      }
    };
    fetchSubmission();
    if (isPolling) {
      intervalId = setInterval(fetchSubmission, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [contestId, submission_no, isPolling]);

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 w-full max-w-4xl mx-auto p-8 relative">
        <div className="absolute top-0 right-0 mt-4 mr-4 flex space-x-4">
          <Button
            variant="outline"
            onClick={() =>
              nav(`/contest/${contestId}/${submission.pid}`)
            }
          >
            返回题目
          </Button>
          <Button
            variant="default"
            onClick={() => nav(`/contest/${contestId}`)}
          >
            返回比赛
          </Button>
        </div>
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 w-full max-w-4xl mx-auto p-8 relative">
        <div className="absolute top-0 right-0 mt-4 mr-4 flex space-x-4">
          <Button
            variant="outline"
            onClick={() =>
              nav(`/contest/${contestId}/${submission.pid}`)
            }
          >
            返回题目
          </Button>
          <Button
            variant="default"
            onClick={() => nav(`/contest/${contestId}`)}
          >
            返回比赛
          </Button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-full p-8">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-3xl font-bold text-blue-700">评测中</h2>
        <p className="text-gray-500 text-lg">正在评测您的提交...</p>
        <div className="w-full max-w-md bg-blue-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-2/3 animate-indeterminate-progress"></div>
        </div>
      </div>
    );
  }
  if (
    submission.status === SubmissionStatus.Failed &&
    submission.verdict === SubmissionVerdict.SystemError
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 w-full max-w-4xl mx-auto p-8 relative">
        <div className="absolute top-0 right-0 mt-4 mr-4 flex space-x-4">
          <Button
            variant="outline"
            onClick={() =>
              nav(`/contest/${contestId}/${submission.pid}`)
            }
          >
            返回题目
          </Button>
          <Button
            variant="default"
            onClick={() => nav(`/contest/${contestId}`)}
          >
            返回比赛
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-full p-8">
          <AlertCircle className="w-16 h-16 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-red-700">系统错误</h2>
        <p className="text-gray-500 text-lg">评测系统发生错误。</p>
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误详情</AlertTitle>
          <AlertDescription>
            {submission.errorDetail || "发生了未知错误。"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="flex flex-col pb-6 p-2 mx-auto w-4/5">
      <div className="flex justify-end mb-4 space-x-4">
        <Button
          variant="outline"
          onClick={() => nav(`/contest/${contestId}/${submission.pid}`)}
        >
          返回题目
        </Button>
        <Button
          variant="default"
          onClick={() => nav(`/contest/${contestId}`)}
        >
          返回比赛
        </Button>
      </div>
      <ContestSubmissionRecord submission={submission} />
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
          <ContestTestPoints resultDetail={submission.resultDetail} />
        )}
    </div>
  );
}
