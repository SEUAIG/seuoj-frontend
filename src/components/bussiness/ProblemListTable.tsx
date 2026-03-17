import React from "react";
import {
  TableBody,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import TagItem from "./TagItem";
import { Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
export interface ProblemRecord {
  pid: string;
  title: string;
  total_submit: number;
  total_accept: number;
  tags: string[];
}
interface ProblemListTableProps {
  records: ProblemRecord[];
  isLoading?: boolean;
}
export default function ProblemListTable({
  records = [],
  isLoading = false,
}: ProblemListTableProps) {
  const nav = useNavigate();
  if (records.length === 0 && isLoading) {
    return (
      <div className="flex justify-center items-center py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        加载题目中...
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        暂无题目数据
      </div>
    );
  }
  const getTagColor = (tagName: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
      "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
      "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
      "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
      "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200",
      "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200",
      "bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200",
      "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
    ];
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  return (
    <div
      className={`rounded-md border ${
        isLoading ? "opacity-60 transition-opacity" : ""
      }`}
    >
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">编号</TableHead>
            <TableHead>题目名称</TableHead>
            <TableHead className="w-[300px]">标签</TableHead>
            <TableHead className="w-[100px] text-right">通过</TableHead>
            <TableHead className="w-[100px] text-right">提交</TableHead>
            <TableHead className="w-[120px] text-right">通过率</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((problem) => {
            const passRate =
              problem.total_submit > 0
                ? ((problem.total_accept / problem.total_submit) * 100).toFixed(
                    2
                  ) + "%"
                : "0.00%";
            return (
              <TableRow key={problem.pid} className="hover:bg-muted/50">
                <TableCell className="font-medium">{problem.pid}</TableCell>
                <TableCell>
                  <span
                    onClick={() => {
                      nav(`/problemsLibrary/${problem.pid}`);
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                  >
                    {problem.title}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags?.slice(0, 3).map((tagName, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`h-6 px-2.5 text-xs font-medium border transition-colors ${getTagColor(
                          tagName
                        )}`}
                      >
                        {tagName}
                      </Badge>
                    ))}
                    {problem.tags?.length > 3 && (
                      <span className="text-xs text-muted-foreground flex items-center px-1">
                        +{problem.tags.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-emerald-600">
                  {problem.total_accept}
                </TableCell>
                <TableCell className="text-right">
                  {problem.total_submit}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {passRate}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
