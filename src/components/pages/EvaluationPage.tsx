import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/* ---------- types ---------- */
interface SubmissionListItem {
  submission_no: string;
  pid: string;
  language: string;
  status: string;
  verdict: string | null;
  submit_time: string;
  finish_time: string | null;
  username: string;
}

interface SubmissionPageResponse {
  code: number;
  message: string;
  data: {
    current: number;
    size: number;
    total: number;
    records: SubmissionListItem[];
  };
}

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
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* ---------- component ---------- */
export default function EvaluationPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<SubmissionListItem[]>([]);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 15;

  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get<SubmissionPageResponse>(
        `/api/submission/page`,
        { params: { current: page, size: pageSize } }
      );
      const { data } = res.data;
      if (data) {
        setRecords(data.records ?? []);
        setTotal(data.total);
        setCurrent(data.current);
      }
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(current);
  }, []);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="flex flex-col pb-6 p-2 mx-auto w-4/5 space-y-4">
      <Helmet>
        <title>评测记录 - SeuOJ</title>
      </Helmet>

      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的评测记录</h1>
        <span className="text-sm text-muted-foreground">
          共 {total} 条记录
        </span>
      </div>

      {/* table */}
      <div
        className={`rounded-md border ${loading ? "opacity-60 transition-opacity" : ""}`}
      >
        {loading && records.length === 0 ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            加载中...
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            暂无评测记录
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead className="w-[100px]">题号</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[100px]">结果</TableHead>
                <TableHead className="w-[100px]">语言</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead className="w-[60px] text-center">详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((item, idx) => {
                const verdictInfo = item.verdict
                  ? verdictDisplayMap[item.verdict]
                  : null;
                const statusInfo = statusDisplayMap[item.status] ?? {
                  label: item.status,
                  color: "",
                };
                return (
                  <TableRow
                    key={item.submission_no}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      navigate(`/submission/${item.submission_no}`)
                    }
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {(current - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-primary font-medium hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/problemsLibrary/${item.pid}`);
                        }}
                      >
                        {item.pid}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusInfo.color}`}
                      >
                        {item.status === "Running" && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {verdictInfo ? (
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${verdictInfo.color}`}
                        >
                          {verdictInfo.label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {languageLabel[item.language] ?? item.language}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTime(item.submit_time)}
                    </TableCell>
                    <TableCell className="text-center">
                      <ExternalLink className="h-4 w-4 inline-block text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current <= 1}
            onClick={() => fetchPage(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            第 {current} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= totalPages}
            onClick={() => fetchPage(current + 1)}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
