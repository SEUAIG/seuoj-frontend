import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code,
  Clock,
  BookCopy,
  Download,
  Tag,
  Activity,
  ListChecks,
  Database,
  Edit,
  MessageCircle,
  Rocket,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { ProblemSection } from "./ProblemSection";
import { ExampleSection } from "./ExampleSection";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import type { ProblemData, ProblemInfo as Info } from "@/models/problem";
interface ProblemDetailInfoProps {
  problem: ProblemData;
  isAuthenticated: boolean;
  practiceButtonLabel?: string;
  onPracticeClick?: (pid: string) => void;
}
export default function ProblemDetailInfo({
  problem,
  isAuthenticated,
  practiceButtonLabel,
  onPracticeClick,
}: ProblemDetailInfoProps) {
  const nav = useNavigate();
  const { user } = useSelector((store: RootState) => store.auth);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const { title, content, tags, pid, totalSubmit, totalAccept } = problem;
  const { description, info = {}, input, output, example, hint } = content;
  const {
    max_cpu_time_ms,
    max_real_time_ms,
    max_memory_kb,
    max_memory_byte,
    min_cpu_time_ms,
    min_memory_kb,
    min_memory_byte,
    test_case_number = "0",
    problem_type = "Standard",
    checker_type = "Standard",
  } = info as Info;
  const formatTimeValue = (val: string | number | undefined) => {
    if (val === undefined || val === null || val === "") return "--";
    if (String(val) === "-1") return "∞";
    return String(val);
  };
  const formatTimeRange = (
    minVal: string | number | undefined,
    maxVal: string | number | undefined
  ) => {
    const min = formatTimeValue(minVal);
    const max = formatTimeValue(maxVal);
    if (min === "--" && max === "--") return "--";
    if (min === "--") return max === "∞" ? "∞" : `${max}ms`;
    if (max === "--") return min === "∞" ? "∞" : `${min}ms`;
    if (min === "∞" || max === "∞") return "∞";
    return min === max ? `${min}ms` : `${min}-${max}ms`;
  };
  const formatMemory = (val: string | number | undefined) => {
    if (val === undefined || val === null || val === "") return "--";
    if (String(val) === "-1") return "∞";
    const kb = Number(val);
    if (Number.isNaN(kb)) return "--";
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)}MiB`;
    return `${kb}KiB`;
  };
  const formatMemoryRange = (
    minVal: string | number | undefined,
    maxVal: string | number | undefined
  ) => {
    const min = formatMemory(minVal);
    const max = formatMemory(maxVal);
    if (min === "--" && max === "--") return "--";
    if (min === "--") return max;
    if (max === "--") return min;
    if (min === "∞" || max === "∞") return "∞";
    return min === max ? min : `${min}-${max}`;
  };
  const maxMemoryValue =
    max_memory_kb ??
    (max_memory_byte !== undefined
      ? (Number(max_memory_byte) / 1024).toString()
      : undefined);
  const minMemoryValue =
    min_memory_kb ??
    (min_memory_byte !== undefined
      ? (Number(min_memory_byte) / 1024).toString()
      : undefined);
  const missingTestcases = Number(test_case_number ?? 0) <= 0;
  const timeLimitText = formatTimeRange(
    min_cpu_time_ms ?? max_cpu_time_ms,
    max_real_time_ms ?? max_cpu_time_ms
  );
  const memoryLimitText = formatMemoryRange(
    minMemoryValue ?? maxMemoryValue,
    maxMemoryValue
  );
  const problemTypeLabel =
    checker_type === "Special"
      ? "SPJ"
      : problem_type === "Interactive"
        ? "交互"
        : "传统";
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* === 1. 头部标题与标签 === */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {pid}. {title}
        </h1>
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="bg-emerald-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            <Code size={16} /> {problemTypeLabel}
          </Badge>
          <Badge variant="outline" className="bg-pink-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            <Clock size={16} /> {timeLimitText}
          </Badge>
          <Badge variant="outline" className="bg-blue-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            <Database size={16} /> {memoryLimitText}
          </Badge>
          <Badge variant="outline" className="bg-cyan-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            <ListChecks size={16} /> {test_case_number} 测试点
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 flex items-center gap-2 px-3 py-1 rounded-lg border border-green-200"
          >
            {totalSubmit > 0 ? ((totalAccept / totalSubmit) * 100).toFixed(1) : "0.0"}%
            通过率 ({totalAccept}/{totalSubmit})
          </Badge>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors flex items-center gap-1.5 px-2.5 py-0.5"
              >
                <Tag size={14} /> {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 justify-start">
        <Button
          onClick={() => nav(`/evaluation?pid=${pid}`)}
          className="bg-green-600 hover:bg-green-700 text-white transition duration-300 ease-in-out transform hover:scale-105"
        >
          <ListChecks className="mr-2 h-4 w-4" />
          提交记录
        </Button>
        <Button
          onClick={() => nav(`/evaluation?pid=${pid}`)}
          className="bg-orange-600 hover:bg-orange-700 text-white transition duration-300 ease-in-out transform hover:scale-105"
        >
          <Activity className="mr-2 h-4 w-4" />
          统计
        </Button>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
          <MessageCircle className="mr-2 h-4 w-4" />
          讨论
        </Button>
        {isAuthenticated && (
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => {
              if (onPracticeClick) {
                onPracticeClick(pid);
                return;
              }
              nav(`/problemsAgent/${pid}`);
            }}
          >
            <Rocket className="mr-2 h-4 w-4" />
            {practiceButtonLabel || "AI练习"}
          </Button>
        )}
        {isAdmin && (
          <>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => nav(`/problemsLibrary/${pid}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑题面
            </Button>
            <Button
              onClick={() => {
                nav(`/problemsLibrary/${pid}/judgeConfig`);
              }}
              className={`text-white transition duration-300 ease-in-out transform hover:scale-105 ${
                missingTestcases
                  ? "bg-red-600 hover:bg-red-700 border-4 border-yellow-300 ring-4 ring-red-300 ring-offset-2 shadow-[0_0_0_4px_rgba(239,68,68,0.35)] animate-pulse"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              <BookCopy className="mr-2 h-4 w-4" />
              评测配置
            </Button>
            <Button
              onClick={() => {
                nav(`/problemsLibrary/${pid}/testfile`);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white transition duration-300 ease-in-out transform hover:scale-105"
            >
              <Download className="mr-2 h-4 w-4" />
              下载文件
            </Button>
          </>
        )}
      </div>
      {/* === 3. 题目内容区 === */}
      <div className="space-y-6">
        <ProblemSection title="题目描述">
          <MarkdownRenderer>{description}</MarkdownRenderer>
        </ProblemSection>
        <ProblemSection title="输入格式">
          <MarkdownRenderer>{input}</MarkdownRenderer>
        </ProblemSection>
        <ProblemSection title="输出格式">
          <MarkdownRenderer>{output}</MarkdownRenderer>
        </ProblemSection>
        {example.map((ex, index) => (
          <ExampleSection
            key={index}
            index={index}
            input={ex.in}
            output={ex.ans}
            isAuthenticated={isAuthenticated}
            explain={ex.description}
          />
        ))}
        {hint && (
          <ProblemSection title="数据范围与提示">
            <MarkdownRenderer>{hint}</MarkdownRenderer>
          </ProblemSection>
        )}
      </div>
    </div>
  );
}
