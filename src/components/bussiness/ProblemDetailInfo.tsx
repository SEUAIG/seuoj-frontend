import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Code,
  Clock,
  BookCopy,
  Download,
  Tag,
  Zap,
  Layers,
  Activity,
  Monitor,
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
import { ProblemData, Info } from "@/components/pages/ProblemDetailPage";
interface ProblemDetailInfoProps {
  problem: ProblemData;
  isAuthenticated: boolean;
  hasTestcases?: boolean;
  practiceButtonLabel?: string;
  onPracticeClick?: (pid: string) => void;
}
export default function ProblemDetailInfo({
  problem,
  isAuthenticated,
  hasTestcases,
  practiceButtonLabel,
  onPracticeClick,
}: ProblemDetailInfoProps) {
  const nav = useNavigate();
  const { user } = useSelector((store: RootState) => store.auth);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const { title, content, tags, pid, totalSubmit, totalAccept } = problem;
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
    test_case_number = "0",
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
  const missingTestcases =
    hasTestcases === undefined
      ? Number(test_case_number ?? 0) <= 0
      : !hasTestcases;
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* === 1. 头部标题与标签 === */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          #{pid}. {title}
        </h1>
        <div className="flex flex-wrap gap-3">
          {/* 通过率 */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none border border-green-200"
                  >
                    {totalSubmit > 0
                      ? ((totalAccept / totalSubmit) * 100).toFixed(1)
                      : "0.0"}
                    % 通过率
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  通过: {totalAccept} / 提交: {totalSubmit}
                </p>
              </TooltipContent>
            </Tooltip>
            {/* 题目类型 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    <Code size={16} />{" "}
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
                    <BookCopy size={16} />{" "}
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
                    <Clock size={16} /> {formatTime(max_cpu_time_ms)}
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
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    <Database size={16} /> {formatMemory(maxMemoryValue)}
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
                  <Badge className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    <Activity size={16} /> 进程/输出
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p className="flex items-center gap-2">
                    <Activity size={14} /> 最大进程数:{" "}
                    {formatCount(max_process_number)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Monitor size={14} /> 最大输出大小:{" "}
                    {formatSize(max_output_size)}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help outline-none">
                  <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                    <ListChecks size={16} /> {test_case_number} 测试点
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>测试点数量: {test_case_number}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        {isAdmin && (
          <>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => nav(`/problemsLibrary/${pid}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑题面
            </Button>
          </>
        )}
        <Button className="bg-green-600 hover:bg-green-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
          <ListChecks className="mr-2 h-4 w-4" />
          提交记录
        </Button>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
          <Activity className="mr-2 h-4 w-4" />
          统计
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
