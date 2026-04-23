import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Calendar, CheckCircle, XCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  getAssignmentOverview,
  type AssignmentOverviewData,
} from "@/services/Class/getAssignmentOverview";

interface AssignmentOverviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  assignmentId: number;
  assignmentTitle: string;
}

export default function AssignmentOverviewDialog({
  isOpen,
  onClose,
  classId,
  assignmentId,
  assignmentTitle,
}: AssignmentOverviewDialogProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["assignmentOverview", classId, assignmentId],
    queryFn: () => getAssignmentOverview(classId, assignmentId),
    enabled: isOpen && !!classId && !!assignmentId,
  });

  const overview: AssignmentOverviewData | undefined = data?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>作业分析 — {assignmentTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center text-red-500 min-h-[200px]">
            加载失败: {error instanceof Error ? error.message : "未知错误"}
          </div>
        ) : !overview ? (
          <div className="text-center text-muted-foreground min-h-[200px] flex items-center justify-center">
            暂无数据
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3">
              <SummaryCard label="题目数" value={overview.problem_count} />
              <SummaryCard label="班级人数" value={overview.member_count} />
              <SummaryCard
                label="平均完成率"
                value={`${overview.avg_completion_rate}%`}
              />
              <SummaryCard
                label="截止时间"
                value={
                  overview.deadline
                    ? format(new Date(overview.deadline), "MM/dd HH:mm")
                    : "无"
                }
              />
            </div>

            {/* Per-problem AC rate chart */}
            {overview.problems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">每题 AC 率</h4>
                <ResponsiveContainer width="100%" height={Math.max(200, overview.problems.length * 36)}>
                  <BarChart
                    layout="vertical"
                    data={overview.problems.map((p) => ({
                      name: p.pid + " " + p.title,
                      ac_rate: p.ac_rate ?? 0,
                    }))}
                    margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "AC 率"]}
                    />
                    <Bar dataKey="ac_rate" radius={[0, 4, 4, 0]}>
                      {overview.problems.map((p, i) => (
                        <Cell
                          key={i}
                          fill={
                            (p.ac_rate ?? 0) >= 70
                              ? "hsl(142, 71%, 45%)"
                              : (p.ac_rate ?? 0) >= 40
                              ? "hsl(43, 96%, 56%)"
                              : "hsl(0, 84%, 60%)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Student completion table */}
            {overview.students.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">学生完成情况</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium">用户名</th>
                        <th className="px-4 py-3 font-medium text-center">
                          AC / 总题数
                        </th>
                        <th className="px-4 py-3 font-medium" style={{ minWidth: 120 }}>
                          完成率
                        </th>
                        {overview.deadline && (
                          <th className="px-4 py-3 font-medium text-center">
                            <Calendar className="h-3.5 w-3.5 inline mr-1" />
                            按时完成
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {overview.students.map((s) => {
                        const rate =
                          s.problem_count > 0
                            ? Math.round((s.ac_count / s.problem_count) * 100)
                            : 0;
                        return (
                          <tr
                            key={s.user_id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {s.nickname || s.username}
                            </td>
                            <td className="px-4 py-2.5 text-center font-mono">
                              {s.ac_count} / {s.problem_count}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <Progress value={rate} className="h-2 flex-1" />
                                <span className="text-xs font-semibold w-10 text-right">
                                  {rate}%
                                </span>
                              </div>
                            </td>
                            {overview.deadline && (
                              <td className="px-4 py-2.5 text-center">
                                {s.submitted_before_deadline ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 inline" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400 inline" />
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  );
}
