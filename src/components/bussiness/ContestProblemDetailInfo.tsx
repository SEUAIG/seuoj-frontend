import { ProblemFormatSections } from "./ProblemFormatSections";
import { statementTypeFor, statementLabels } from "@/lib/statementType";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProblemSection } from "./ProblemSection";
import { ExampleSection } from "./ExampleSection";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import type { ProblemData, ProblemInfo as Info } from "@/models/problem";
import { Code, Clock, Database } from "lucide-react";
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
    min_cpu_time_ms,
    min_memory_kb,
    min_memory_byte,
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
  const timeLimitText = formatTimeRange(
    min_cpu_time_ms ?? max_cpu_time_ms,
    max_real_time_ms ?? max_cpu_time_ms
  );
  const memoryLimitText = formatMemoryRange(
    minMemoryValue ?? maxMemoryValue,
    maxMemoryValue
  );
  const kind = statementTypeFor(content);
  const problemTypeLabel = statementLabels[kind];
  return (
    <div className="problem-statement space-y-8 p-5 md:p-8">
      {/* === 1. 头部标题与标签 === */}
      <div className="problem-statement-header space-y-4">
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
        </div>
      </div>
      {/* === 2. 题目内容 === */}
      <div className="space-y-6">
        <ProblemSection title="题目描述">
          <MarkdownRenderer>{description}</MarkdownRenderer>
        </ProblemSection>
        <ProblemFormatSections kind={kind} input={input} output={output} />
        {example?.map((ex, index) => (
          <ExampleSection
            key={index}
            index={index}
            input={ex.in}
            output={ex.ans}
            explain={ex.description}
            isAuthenticated={isAuthenticated}
          />
        ))}
        {hint && (
          <ProblemSection title={hint.startsWith("### 样例解释\n") ? "样例解释" : "数据范围与提示"}>
            <MarkdownRenderer previewImages>{hint.replace(/^### 样例解释\n+/, "")}</MarkdownRenderer>
          </ProblemSection>
        )}
      </div>
    </div>
  );
}
