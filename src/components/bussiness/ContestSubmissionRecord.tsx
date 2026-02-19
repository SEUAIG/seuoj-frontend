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
import { SubmissionData } from "../pages/SubmissionPage";
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
  } = submission;
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
          <TableCell className="text-center">{username}</TableCell>
          <TableCell className="text-center">
            {verdict && <AnswerState state={verdict} />}
          </TableCell>
          <TableCell className="text-center">
             <ScoreBadge score={score ?? 0} />
          </TableCell>
          <TableCell className="text-center">{language}</TableCell>
          <TableCell className="text-center">{new Date(submitTime).toLocaleString()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
