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
import AnswerState from "../common/AnswerState";
import ScoreBadge from "../common/ScoreBadage";
import type { SubmissionData } from "@/models/submission";
import { format } from "date-fns";

interface SubmissionRecordProps {
  submission: SubmissionData;
  title?: string | null;
}
export default function SubmissionRecord({
  submission,
  title,
}: SubmissionRecordProps) {
  const nav = useNavigate();
  const from = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
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
  let totalTime = 0;
  let maxMemory = 0;
  
  if (!isError && resultDetail) {
    totalTime = resultDetail.reduce((acc, item) => acc + item.time, 0);
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
  
  const timeDisplay = isError ? "0ms" : `${totalTime}ms`;
  const memoryDisplay = isError ? "0KB" : `${(maxMemory / 1024).toFixed(0)}KB`;
  const scoreDisplay = isError ? 0 : totalScore;
  
  const formattedTime = submitTime ? format(new Date(submitTime), "yyyy-MM-dd HH:mm:ss") : "";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">编号</TableHead>
          <TableHead className="text-center">题目</TableHead>
          <TableHead className="text-center">状态</TableHead>
          <TableHead className="text-center">分数</TableHead>
          <TableHead className="text-center">总时间</TableHead>
          <TableHead className="text-center">内存</TableHead>
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
              onClick={() => nav(`/problemsLibrary/${pid}?from=${from}`)}
            >
              {title || pid}
            </span>
          </TableCell>
          {/* 优先使用查询参数的title 否则使用pid */}
          <TableCell className="text-center">
            {verdict && <AnswerState state={verdict} />}
          </TableCell>
          <TableCell className="text-center group">
            <ScoreBadge score={scoreDisplay} />
          </TableCell>
          <TableCell className="text-center">{timeDisplay}</TableCell>
          <TableCell className="text-center">{memoryDisplay}</TableCell>
          <TableCell className="text-center">{language}</TableCell>
          <TableCell className="text-center">
            {userId ? (
              <span
                className="cursor-pointer text-primary hover:underline"
                onClick={() => nav(`/user/${userId}`)}
              >
                {nickname || username}
              </span>
            ) : (
              nickname || username
            )}
          </TableCell>
          <TableCell className="text-center">{formattedTime}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
