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
import AnswerState, { stateColorMap } from "../common/AnswerState";

export default function SubmissionRecord() {
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
          <TableCell>#63869</TableCell>
          <TableCell>#1.A+B Problem</TableCell>
          <TableCell>
            <AnswerState state="Accepted" className={stateColorMap["Accepted"]} />
          </TableCell>
          <TableCell>100</TableCell>
          <TableCell>3ms</TableCell>
          <TableCell>284K</TableCell>
          <TableCell>C++/203B</TableCell>
          <TableCell>nahida</TableCell>
          <TableCell>2025-12-16</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
