import React from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContestRecord } from "@/services/Contest/getContestPage";
type ContestListTableProps = {
  records: ContestRecord[];
  isLoading: boolean;
  isFetching: boolean;
  formatContestTime: (start?: string, end?: string) => string;
  statusLabelMap: Map<string, string>;
  getOutlineTagClass: (value: string) => string;
  onOpenContest: (contestPublicId: string) => void;
};
export default function ContestListTable({
  records,
  isLoading,
  isFetching,
  formatContestTime,
  statusLabelMap,
  getOutlineTagClass,
  onOpenContest,
}: ContestListTableProps) {
  return (
    <div
      className={`rounded-xl border bg-card shadow-sm ${
        isLoading || isFetching ? "opacity-60 transition-opacity" : ""
      }`}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60">
            <TableHead>比赛名称</TableHead>
            <TableHead className="w-[220px]">时间</TableHead>
            <TableHead className="w-[120px]">状态</TableHead>
            <TableHead className="w-[120px]">赛制</TableHead>
            <TableHead className="w-[120px] text-right">可见性</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 && (isLoading || isFetching) ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  加载中...
                </div>
              </TableCell>
            </TableRow>
          ) : records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center">
                <span className="text-sm text-muted-foreground">
                  暂无比赛数据
                </span>
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.contest_public_id}>
                <TableCell className="font-medium py-4">
                  <button
                    type="button"
                    onClick={() => onOpenContest(record.contest_public_id)}
                    className="text-left text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                  >
                    {record.title ?? "未命名比赛"}
                  </button>
                  {record.subtitle && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {record.subtitle}
                    </div>
                  )}
                  {record.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {record.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatContestTime(record.start_time, record.end_time)}
                </TableCell>
                <TableCell>
                  {record.status ? (
                    <Badge
                      variant="outline"
                      className={`h-6 px-2.5 text-xs font-medium ${getOutlineTagClass(
                        record.status
                      )}`}
                    >
                      {statusLabelMap.get(record.status) ?? record.status}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {record.rule_type ? (
                    <Badge
                      variant="outline"
                      className={`h-6 px-2.5 text-xs font-medium ${getOutlineTagClass(
                        record.rule_type
                      )}`}
                    >
                      {record.rule_type}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {record.is_public ? "公开" : "私有"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
