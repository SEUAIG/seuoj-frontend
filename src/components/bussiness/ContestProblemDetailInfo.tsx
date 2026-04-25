import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProblemSection } from "./ProblemSection";
import { ExampleSection } from "./ExampleSection";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import type { ProblemData, ProblemInfo as Info } from "@/models/problem";
import { Clock, Database } from "lucide-react";
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
    max_cpu_time_ms,
    max_real_time_ms,
    max_memory_kb,
    max_memory_byte,
    max_output_size = "10000",
    min_cpu_time_ms,
    min_memory_kb,
    min_memory_byte,
    test_case_number = "1",
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
  const formatSize = (val: string | number) => {
    if (String(val) === "-1") return "∞";
    const bytes = Number(val);
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KiB`;
    return `${bytes} B`;
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
            {problemTypeLabel}
          </Badge>
          <Badge variant="outline" className="bg-pink-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            <Clock size={16} /> {timeLimitText}
          </Badge>
          <Badge variant="outline" className="bg-blue-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            <Database size={16} /> {memoryLimitText}
          </Badge>
          <Badge variant="outline" className="bg-cyan-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            输出限制 {formatSize(max_output_size)}
          </Badge>
          <Badge variant="outline" className="bg-teal-600 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
            测试点 {test_case_number}
          </Badge>
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
