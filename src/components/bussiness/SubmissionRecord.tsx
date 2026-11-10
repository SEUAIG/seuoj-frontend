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
import { useNavigate } from "react-router-dom";
import AnswerState, { AnswerStateNew } from "../common/AnswerState";
import ScoreBadge from "../common/ScoreBadage";
import type { SubmissionData } from "@/models/submission";
import SubmitterLink from "../common/SubmitterLink";
import { format } from "date-fns";

interface SubmissionRecordProps {
  submission: SubmissionData;
  title?: string | null;
  problemUrl: string;
}
export default function SubmissionRecord({
  submission,
  title,
  problemUrl,
}: SubmissionRecordProps) {
  const nav = useNavigate();
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
    username,
    nickname,
    userId,
    score,
  } = submission;
  const isError =
    verdict === "CompileError" ||
    verdict === "JudgeError" ||
    verdict === "SystemError";
  let totalScore = score !== undefined ? score : 0;
  let maxTime = 0;
  let maxMemory = 0;
  
  if (!isError && resultDetail) {
    maxTime = resultDetail.reduce((acc, item) => Math.max(acc, item.time ?? 0), 0);
    maxMemory = resultDetail.reduce((acc, item) => Math.max(acc, item.mem), 0);
    
    // 如果没有返回总分，则回退到通过点比例计算
    if (score === undefined || score === null) {
      const passedCount = resultDetail.filter(
        (item) => item.type === "Accepted"
      ).length;
      if (resultDetail.length > 0) {
        totalScore = Math.round((passedCount / resultDetail.length) * 100);
      }
    }
  }
  
  const time = submission.contestId != null ? submission.maxTime : maxTime;
  const memory = submission.contestId != null ? submission.maxMemory : maxMemory;
  const timeDisplay = time == null ? "—" : `${time}ms`;
  const memoryDisplay = memory == null ? "—" : `${(memory / 1024).toFixed(0)}KB`;
  const showScore = submission.contestId == null || score != null;
  const scoreDisplay = isError ? 0 : totalScore;
  
  const formattedTime = submitTime ? format(new Date(submitTime), "yyyy-MM-dd HH:mm:ss") : "";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">编号</TableHead>
          <TableHead className="text-center">题目</TableHead>
          <TableHead className="text-center">状态</TableHead>
          {showScore && <TableHead className="text-center">分数</TableHead>}
          <TableHead className="text-center">最大单点耗时</TableHead>
          <TableHead className="text-center">峰值内存</TableHead>
          <TableHead className="text-center">代码</TableHead>
          <TableHead className="text-center">提交者</TableHead>
          <TableHead className="text-center">提交时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-center">{pid}</TableCell>
          <TableCell className="text-center">
            <span
              className="cursor-pointer text-primary hover:underline"
              onClick={() => nav(problemUrl)}
            >
              {title || pid}
            </span>
          </TableCell>
          <TableCell className="text-center">
            {verdict ? (
              <AnswerState state={verdict} />
            ) : (
              <AnswerStateNew status={status} />
            )}
          </TableCell>
          {showScore && <TableCell className="text-center group">
            <ScoreBadge score={scoreDisplay ?? 0} />
          </TableCell>}
          <TableCell className="text-center">{timeDisplay}</TableCell>
          <TableCell className="text-center">{memoryDisplay}</TableCell>
          <TableCell className="text-center">{language}</TableCell>
          <TableCell className="text-center">
            <SubmitterLink username={username} nickname={nickname} userId={userId} />
          </TableCell>
          <TableCell className="text-center">{formattedTime}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
