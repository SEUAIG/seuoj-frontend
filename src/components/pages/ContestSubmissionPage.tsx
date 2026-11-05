import { useEffect, useState } from "react";
import ContestSubmissionRecord from "../bussiness/ContestSubmissionRecord";
import CodeShow from "../common/CodeShow";
import TestPoints from "../bussiness/TestPoints";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getContestSubmissionDetail } from "@/services/Contest/getContestSubmissionDetail";
import type {
  SubmissionData,
  SubmissionStatus,
  SubmissionVerdict,
} from "@/models/submission";

const FOREGROUND_POLL_INTERVAL = 1000;
const BACKGROUND_POLL_INTERVAL = 5000;

export default function ContestSubmissionPage() {
  const { id, submission_no } = useParams();
  const contestId = Number(id);
  const nav = useNavigate();
  const from = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (!contestId || !submission_no || cancelled) return;
      try {
        const data = await getContestSubmissionDetail(contestId, submission_no);
        if (data) {
          // 转换 API 返回的数据格式为 SubmissionData 格式，以便复用组件
          const submissionData: SubmissionData = {
            assignmentId: null,
            contestId,
            maxTime: data.max_time,
            maxMemory: data.max_memory,
            testDataVisible: data.test_data_visible,
            subtasks: data.subtasks,
            submissionNo: data.submission_no,
            pid: data.problem.pid, // 使用 problem 对象中的 pid
            language: data.language || "Unknown",
            status: data.status as SubmissionStatus,
            verdict: data.verdict as SubmissionVerdict | null,
            resultDetail: data.result_detail ?? null,
            errorDetail: data.error_detail ?? null,
            submitTime: data.submit_time,
            finishTime: "", // API 中未提供 finish_time，设为空字符串或根据需要处理
            code: data.code || "",
            username: data.username,
            score: data.score ?? undefined, // 比赛特有的分数
          };
          if (cancelled) return;
          setSubmission(submissionData);
          setLoading(false);
          const shouldContinuePolling = !(
            submissionData.status === "Finished" ||
            submissionData.status === "Failed"
          );
          if (shouldContinuePolling) {
            timeoutId = setTimeout(fetchSubmission, getNextDelay());
          }
        }
      } catch (error) {
        console.error("Error fetching contest submission:", error);
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
  }, [contestId, submission_no]);

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
          onClick={() => nav(`/contest/${contestId}/${submission.pid}?from=${from}`)}
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
          <TestPoints resultDetail={submission.resultDetail} subtasks={submission.subtasks} showData={submission.testDataVisible === true} />
        )}
    </div>
  );
}
