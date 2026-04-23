import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProblemSection } from "./ProblemSection";
import { ExampleSection } from "./ExampleSection";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { ProblemData, Info } from "@/components/pages/ProblemDetailPage";
import { Clock, Database, Layers, Zap } from "lucide-react";
interface ContestProblemDetailInfoProps {
  problem: ProblemData;
  isAuthenticated: boolean;
}
export default function ContestProblemDetailInfo({
  problem,
  isAuthenticated,
}: ContestProblemDetailInfoProps) {
  const { title, content, pid } = problem;
  const { description, info = {}, input, output, example, hint } = content;
  const {
    max_cpu_time_ms = "1000",
    max_real_time_ms = "2000",
    max_memory_kb,
    max_memory_byte = "134217728",
    max_stack_byte = "33554432",
    max_process_number = "1",
    max_output_size = "10000",
    min_cpu_time_ms,
    min_memory_kb,
    min_memory_byte,
    test_case_number = "1",
    problem_type = "Standard",
    checker_type = "Standard",
  } = info as Info;
  const formatTime = (val: string | number) =>
    String(val) === "-1" ? "∞" : `${val} ms`;
  const formatMemory = (val: string | number) => {
    if (String(val) === "-1") return "∞";
    const kb = Number(val);
    if (kb >= 1024) return `${(kb / 1024).toFixed(0)} MiB`;
    return `${kb} KiB`;
  };
  const formatCount = (val: string | number) =>
    String(val) === "-1" ? "∞" : val;
  const formatSize = (val: string | number) => {
    if (String(val) === "-1") return "∞";
    const bytes = Number(val);
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KiB`;
    return `${bytes} B`;
  };
  const maxMemoryValue =
    max_memory_kb ?? (Number(max_memory_byte) / 1024).toString();
  const minMemoryValue =
    min_memory_kb ??
    (min_memory_byte !== undefined
      ? (Number(min_memory_byte) / 1024).toString()
      : undefined);
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* === 1. 头部标题与标签 === */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {pid}. {title}
        </h1>
        <div className="flex flex-wrap gap-3">
          {/* 题目类型 */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    {problem_type === "Interactive" ? "交互" : "传统"}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  题目类型:{" "}
                  {problem_type === "Interactive" ? "交互题" : "传统题"}
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    {checker_type === "Special" ? "SPJ" : "文本比对"}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  评测方式:{" "}
                  {checker_type === "Special"
                    ? "Special Judge (特判)"
                    : "标准文本比对 (忽略行末空格)"}
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    CPU: {formatTime(max_cpu_time_ms)}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p className="flex items-center gap-2">
                    <Clock size={14} /> CPU 时间限制:{" "}
                    {formatTime(max_cpu_time_ms)}
                  </p>
                  {min_cpu_time_ms && (
                    <p className="flex items-center gap-2">
                      <Clock size={14} /> 最小 CPU 时间:{" "}
                      {formatTime(min_cpu_time_ms)}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Zap size={14} /> 实际时间限制:{" "}
                    {formatTime(max_real_time_ms)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    Real: {formatTime(max_real_time_ms)}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>最大实际时间限制: {formatTime(max_real_time_ms)}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    MEM: {formatMemory(maxMemoryValue)}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p className="flex items-center gap-2">
                    <Database size={14} /> 内存限制:{" "}
                    {formatMemory(maxMemoryValue)}
                  </p>
                  {minMemoryValue && (
                    <p className="flex items-center gap-2">
                      <Database size={14} /> 最小内存限制:{" "}
                      {formatMemory(minMemoryValue)}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Layers size={14} /> 栈空间限制:{" "}
                    {formatMemory(max_stack_byte)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    Stack: {formatMemory(max_stack_byte)}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>最大栈内存限制: {formatMemory(max_stack_byte)}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    Proc: {formatCount(max_process_number)}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>最大进程数: {formatCount(max_process_number)}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    Out: {formatSize(max_output_size)}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>最大输出大小: {formatSize(max_output_size)}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    Case: {test_case_number}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>测试点数量: {test_case_number}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {/* === 2. 题目内容 === */}
      <div className="space-y-8">
        <ProblemSection title="题目描述">
          <MarkdownRenderer>{description}</MarkdownRenderer>
        </ProblemSection>
        {input && (
          <ProblemSection title="输入格式">
            <MarkdownRenderer>{input}</MarkdownRenderer>
          </ProblemSection>
        )}
        {output && (
          <ProblemSection title="输出格式">
            <MarkdownRenderer>{output}</MarkdownRenderer>
          </ProblemSection>
        )}
        {example && example.length > 0 && (
          <div className="space-y-6">
            {example.map((ex, idx) => (
              <ExampleSection
                key={idx}
                index={idx + 1}
                input={ex.in}
                output={ex.ans}
                explain={ex.description}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
        {hint && (
          <ProblemSection title="数据范围与提示">
            <MarkdownRenderer>{hint}</MarkdownRenderer>
          </ProblemSection>
        )}
      </div>
    </div>
  );
}
