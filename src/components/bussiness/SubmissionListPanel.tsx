import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ExternalLink, Search, RefreshCw, X } from "lucide-react";
import ClassPagination from "./ClassPagination";
import { Button } from "../ui/button";

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
  PartiallyAccepted: {
    label: "PA",
    color: "bg-teal-100 text-teal-700 border-teal-300",
  },
};

const verdictOptions = [
  { value: "Accepted", label: "AC - Accepted" },
  { value: "WrongAnswer", label: "WA - Wrong Answer" },
  { value: "TimeLimitExceeded", label: "TLE - Time Limit Exceeded" },
  { value: "MemoryLimitExceeded", label: "MLE - Memory Limit Exceeded" },
  { value: "RuntimeError", label: "RE - Runtime Error" },
  { value: "CompileError", label: "CE - Compile Error" },
  { value: "SystemError", label: "SE - System Error" },
  { value: "PartiallyAccepted", label: "PA - Partially Accepted" },
];

const languageOptions = [
  { value: "C", label: "C" },
  { value: "Cpp", label: "C++" },
  { value: "Cpp11", label: "C++11" },
  { value: "Cpp17", label: "C++17" },
  { value: "Cpp20", label: "C++20" },
  { value: "Java17", label: "Java 17" },
  { value: "Python3_12", label: "Python 3" },
  { value: "Nodejs22", label: "Node.js" },
  { value: "Go1_22", label: "Go" },
];

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

interface SubmissionListPanelProps {
  assignmentId?: number;
  queryKeyPrefix?: string;
  pid?: string;
}

export default function SubmissionListPanel({
  assignmentId,
  queryKeyPrefix = "submissionPage",
  pid: initialPid = "",
}: SubmissionListPanelProps) {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isPrivileged =
    user?.role === "teacher" ||
    user?.role === "admin" ||
    user?.role === "superadmin";

  const [current, setCurrent] = useState(1);
  const size = 20;
  const [pidInput, setPidInput] = useState(initialPid);
  const [usernameInput, setUsernameInput] = useState("");
  const [pidFilter, setPidFilter] = useState(initialPid);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  const hasFilters = pidFilter || verdictFilter || languageFilter || usernameFilter;

  const clearAllFilters = () => {
    setCurrent(1);
    setPidInput("");
    setUsernameInput("");
    setPidFilter("");
    setUsernameFilter("");
    setVerdictFilter("");
    setLanguageFilter("");
  };

  const updateFilter = (key: string, value: string) => {
    setCurrent(1);
    switch (key) {
      case "pid":
        setPidFilter(value);
        break;
      case "username":
        setUsernameFilter(value);
        break;
      case "verdict":
        setVerdictFilter(value);
        break;
      case "language":
        setLanguageFilter(value);
        break;
    }
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      queryKeyPrefix,
      current,
      size,
      pidFilter,
      verdictFilter,
      languageFilter,
      usernameFilter,
      assignmentId,
    ],
    queryFn: () =>
      getSubmissionPage({
        current,
        size,
        pid: pidFilter || undefined,
        verdict: verdictFilter || undefined,
        language: languageFilter || undefined,
        username: usernameFilter || undefined,
        assignment_id: assignmentId,
      }),
    placeholderData: keepPreviousData,
  });

  const records = data?.data?.records || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="space-y-4">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="题号 (如 P1001)"
          value={pidInput}
          onChange={(e) => setPidInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilter("pid", pidInput.trim());
          }}
          onBlur={() => updateFilter("pid", pidInput.trim())}
          className="w-40 h-9"
        />
        {isPrivileged && (
          <Input
            placeholder="用户名"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                updateFilter("username", usernameInput.trim());
            }}
            onBlur={() => updateFilter("username", usernameInput.trim())}
            className="w-36 h-9"
          />
        )}
        <Select
          value={verdictFilter}
          onValueChange={(v) => updateFilter("verdict", v)}
        >
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="结果筛选" />
          </SelectTrigger>
          <SelectContent>
            {verdictOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={languageFilter}
          onValueChange={(v) => updateFilter("language", v)}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="语言筛选" />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            清除筛选
          </Button>
        )}
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
            />
            刷新
          </Button>
        </div>
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
              <p className="text-muted-foreground text-lg mb-2">
                {hasFilters ? "未找到匹配的评测记录" : "暂无评测记录"}
              </p>
              <p className="text-muted-foreground text-sm">
                {hasFilters ? "试试调整筛选条件" : "去题库找道题试试手吧！"}
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
                      <TableHead className="w-[120px] text-center h-10 py-2">
                        提交者
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
                          <TableCell className="text-sm text-center py-2">
                            {item.user_id ? (
                              <span
                                className="cursor-pointer text-primary hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/user/${item.user_id}`);
                                }}
                              >
                                {item.nickname || item.username || "-"}
                              </span>
                            ) : (
                              item.nickname || item.username || "-"
                            )}
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
                    onPageChange={setCurrent}
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
