import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getSubmissionPage } from "@/services/Submission/getSubmissionPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, Search, RefreshCw } from "lucide-react";
import ClassPagination from "../bussiness/ClassPagination";
import { Button } from "../ui/button";

/* ---------- helpers ---------- */
const verdictDisplayMap: Record<string, { label: string; color: string }> = {
  Accepted: {
    label: "AC",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  WrongAnswer: {
    label: "WA",
    color: "bg-red-100 text-red-700 border-red-300",
  },
  TimeLimitExceeded: {
    label: "TLE",
    color: "bg-amber-100 text-amber-700 border-amber-300",
  },
  MemoryLimitExceeded: {
    label: "MLE",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  RuntimeError: {
    label: "RE",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  CompileError: {
    label: "CE",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  SystemError: {
    label: "SE",
    color: "bg-gray-100 text-gray-700 border-gray-300",
  },
  JudgeError: {
    label: "JE",
    color: "bg-gray-100 text-gray-700 border-gray-300",
  },
  JudgendError: {
    label: "JE",
    color: "bg-gray-100 text-gray-700 border-gray-300",
  },
};

const statusDisplayMap: Record<string, { label: string; color: string }> = {
  Pending: {
    label: "等待中",
    color: "bg-slate-100 text-slate-600 border-slate-300",
  },
  Running: {
    label: "评测中",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  Finished: {
    label: "已完成",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  Failed: {
    label: "失败",
    color: "bg-red-100 text-red-700 border-red-300",
  },
};

const languageLabel: Record<string, string> = {
  C: "C",
  Cpp: "C++",
  Cpp11: "C++11",
  Cpp17: "C++17",
  Cpp20: "C++20",
  Java17: "Java 17",
  Python3_12: "Python 3",
  Nodejs22: "Node.js",
  Go1_22: "Go",
};

function formatTime(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* ---------- component ---------- */
export default function EvaluationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const current = parseInt(searchParams.get("page") || "1");
  const size = parseInt(searchParams.get("size") || "20");

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["submissionPage", current, size],
    queryFn: () => getSubmissionPage({ current, size }),
    placeholderData: keepPreviousData,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), size: size.toString() });
  };

  const records = data?.data?.records || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>评测记录 - SeuOJ</title>
      </Helmet>

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">我的评测记录</div>
          <div className="text-sm text-muted-foreground mt-1">
            查看和管理你的所有代码提交状态
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          刷新状态
        </Button>
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent">
        <CardContent className="flex-1 p-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center text-red-500 min-h-[400px]">
              加载失败: {error instanceof Error ? error.message : "未知错误"}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-muted/20 rounded-lg border border-dashed">
              <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">暂无评测记录</p>
              <p className="text-muted-foreground text-sm">
                去题库找道题试试手吧！
              </p>
            </div>
          ) : (
            <div
              className={`flex-1 flex flex-col bg-card rounded-md border ${
                isFetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 h-10">
                      <TableHead className="w-[60px] text-center h-10 py-2">
                        #
                      </TableHead>
                      <TableHead className="w-[120px] text-center h-10 py-2">
                        题号
                      </TableHead>
                      <TableHead className="w-[120px] text-center h-10 py-2">
                        状态
                      </TableHead>
                      <TableHead className="w-[120px] text-center h-10 py-2">
                        结果
                      </TableHead>
                      <TableHead className="w-[120px] text-center h-10 py-2">
                        语言
                      </TableHead>
                      <TableHead className="text-center h-10 py-2">
                        提交时间
                      </TableHead>
                      <TableHead className="w-[80px] text-center h-10 py-2">
                        详情
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y">
                    {records.map((item, idx) => {
                      const verdictInfo = item.verdict
                        ? verdictDisplayMap[item.verdict]
                        : null;
                      const statusInfo = statusDisplayMap[item.status] ?? {
                        label: item.status,
                        color: "bg-slate-100 text-slate-600 border-slate-300",
                      };
                      return (
                        <TableRow
                          key={item.submission_no}
                          className="hover:bg-muted/50 cursor-pointer transition-colors h-12"
                          onClick={() =>
                            navigate(`/submission/${item.submission_no}`)
                          }
                        >
                          <TableCell className="text-muted-foreground text-xs text-center py-2">
                            {(current - 1) * size + idx + 1}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <span
                              className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/problemsLibrary/${item.pid}`);
                              }}
                            >
                              {item.pid}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <Badge
                              variant="outline"
                              className={`text-[11px] px-2 py-0 h-5 font-normal border ${statusInfo.color}`}
                            >
                              {item.status === "Running" && (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              )}
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center py-2">
                            {verdictInfo ? (
                              <Badge
                                variant="outline"
                                className={`text-[11px] px-2 py-0 h-5 font-semibold border ${verdictInfo.color}`}
                              >
                                {verdictInfo.label}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-center py-2">
                            {languageLabel[item.language] ?? item.language}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono text-center py-2">
                            {formatTime(item.submit_time)}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t mt-auto flex justify-center">
                  <ClassPagination
                    totalPages={totalPages}
                    currentPage={current}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
