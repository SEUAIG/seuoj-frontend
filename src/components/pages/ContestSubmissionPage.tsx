import { useEffect, useState } from "react";
import ContestSubmissionRecord from "../bussiness/ContestSubmissionRecord";
import CodeShow from "../common/CodeShow";
import TestPoints from "../bussiness/TestPoints";
import { Link, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import ContestShell from "@/components/contest/ContestShell";
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
      <ContestShell contestId={contestId} tab="submissions">
        <div className="space-y-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </ContestShell>
    );
  }
  if (!submission) {
    return (
      <ContestShell contestId={contestId} tab="submissions">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>加载提交数据失败。</AlertDescription>
        </Alert>
      </ContestShell>
    );
  }
  return (
    <ContestShell contestId={contestId} tab="submissions">
      <div className="mb-4 flex justify-end gap-5 text-sm text-slate-500">
        <Link to={`/contest/${contestId}/${submission.pid}`} className="hover:text-slate-900">
          ← 回到题目
        </Link>
        <Link to={`/contest/${contestId}/submissions`} className="hover:text-slate-900">
          全部提交
        </Link>
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
    </ContestShell>
  );
}
