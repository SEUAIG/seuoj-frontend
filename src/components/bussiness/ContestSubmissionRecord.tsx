import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import AnswerState from "../common/AnswerState";
import ScoreBadge from "../common/ScoreBadage";
import type { SubmissionData } from "@/models/submission";
import { format } from "date-fns";

interface ContestSubmissionRecordProps {
  submission: SubmissionData;
}
export default function ContestSubmissionRecord({
  submission,
}: ContestSubmissionRecordProps) {
  const {
    submissionNo,
    pid,
    language,
    verdict,
    score,
    submitTime,
    username,
    nickname,
  } = submission;
  
  const formattedTime = submitTime ? format(new Date(submitTime), "yyyy-MM-dd HH:mm:ss") : "";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">运行编号</TableHead>
          <TableHead className="text-center">题号</TableHead>
          <TableHead className="text-center">用户名</TableHead>
          <TableHead className="text-center">状态</TableHead>
          <TableHead className="text-center">分数</TableHead>
          <TableHead className="text-center">语言</TableHead>
          <TableHead className="text-center">提交时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-center">{submissionNo}</TableCell>
          <TableCell className="text-center">{pid}</TableCell>
          <TableCell className="text-center">{nickname || username}</TableCell>
          <TableCell className="text-center">
            {verdict && <AnswerState state={verdict} />}
          </TableCell>
          <TableCell className="text-center">
             <ScoreBadge score={score ?? 0} />
          </TableCell>
          <TableCell className="text-center">{language}</TableCell>
          <TableCell className="text-center">{formattedTime}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
