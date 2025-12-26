import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import AnswerState from "../common/AnswerState";
import ScoreBadge from "../common/ScoreBadage";
import { SubmissionData } from "../pages/SubmissionPage";
interface SubmissionRecordProps {
  submission: SubmissionData;
  title?: string | null;
}
export default function SubmissionRecord({
  submission,
  title,
}: SubmissionRecordProps) {
  const {
    submissionNo,
    pid,
    language,
    status,
    verdict,
    resultDetail,
    errorDetail,
    submitTime,
    finishTime,
  } = submission;
  const isError =
    verdict === "CompileError" ||
    verdict === "JudgeError" ||
    verdict === "SystemError";

  // 计算总分、总时间和最大内存
  let totalScore = 0;
  let totalTime = 0;
  let maxMemory = 0;

  if (!isError && resultDetail) {

    totalTime = resultDetail.reduce((acc, item) => acc + item.time, 0);
    maxMemory = resultDetail.reduce((acc, item) => Math.max(acc, item.mem), 0);
    const passedCount = resultDetail.filter(
      (item) => item.ans === "Accepted" || item.ans === "Correct"
    ).length; 
    if (verdict === "Accepted") {
      totalScore = 100;
    }
  }
  const timeDisplay = isError ? "0ms" : `${totalTime}ms`;
  const memoryDisplay = isError ? "0KB" : `${(maxMemory / 1024).toFixed(0)}KB`; 
  const scoreDisplay = isError ? 0 : totalScore;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>编号</TableHead>
          <TableHead>题目</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>分数</TableHead>
          <TableHead>总时间</TableHead>
          <TableHead>内存</TableHead>
          <TableHead>代码/答案文件</TableHead>
          <TableHead>提交者</TableHead>
          <TableHead>提交时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{`#${submissionNo?.substring(0, 8) || pid}`}</TableCell>
          <TableCell>{`#${title || pid}`}</TableCell>
          <TableCell>{verdict && <AnswerState state={verdict} />}</TableCell>
          <TableCell>
            <ScoreBadge score={scoreDisplay} />
          </TableCell>
          <TableCell>{timeDisplay}</TableCell>
          <TableCell>{memoryDisplay}</TableCell>
          <TableCell>{language}</TableCell>
          <TableCell>User</TableCell>
          <TableCell>{submitTime}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
