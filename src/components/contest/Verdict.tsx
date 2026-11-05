import { Ban, Check, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ABBR: Record<string, string> = {
  Accepted: "AC",
  WrongAnswer: "WA",
  TimeLimitExceeded: "TLE",
  MemoryLimitExceeded: "MLE",
  RuntimeError: "RE",
  CompileError: "CE",
  JudgeError: "JE",
  SystemError: "SE",
  PartiallyAccepted: "PA",
  Skipped: "SKIP",
};

const NAME: Record<string, string> = {
  Accepted: "Accepted",
  WrongAnswer: "Wrong Answer",
  TimeLimitExceeded: "Time Limit Exceeded",
  MemoryLimitExceeded: "Memory Limit Exceeded",
  RuntimeError: "Runtime Error",
  CompileError: "Compile Error",
  JudgeError: "Judge Error",
  SystemError: "System Error",
  PartiallyAccepted: "Partially Accepted",
  Skipped: "Skipped",
};

const COLOR: Record<string, string> = {
  Accepted: "text-green-700",
  PartiallyAccepted: "text-orange-700",
  TimeLimitExceeded: "text-orange-700",
  CompileError: "text-slate-500",
  JudgeError: "text-slate-500",
  SystemError: "text-slate-500",
};

/** 结果：一个符号 + 缩写，只给文字染色 */
export default function Verdict({
  status,
  verdict,
  originalVerdict,
  className,
}: {
  status?: string | null;
  verdict?: string | null;
  /** 被跳过的提交的原结果，只用于悬停提示 */
  originalVerdict?: string | null;
  className?: string;
}) {
  if (verdict === "Skipped") {
    return (
      <span
        className={cn("inline-flex items-center gap-1 font-mono text-[13px] font-semibold text-slate-400", className)}
        title={`已跳过，不计入榜单${originalVerdict ? `（原结果 ${NAME[originalVerdict] ?? originalVerdict}）` : ""}`}
      >
        <Ban className="h-3.5 w-3.5" strokeWidth={3} />
        SKIP
      </span>
    );
  }
  const pending = status === "Pending" || status === "Running" || (!verdict && status !== "Failed");
  if (pending) {
    return (
      <span
        className={cn("inline-flex items-center text-blue-600 animate-pulse", className)}
        title="评测中"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  const v = verdict ?? "SystemError";
  const Icon = v === "Accepted" ? Check : X;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[13px] font-semibold",
        COLOR[v] ?? "text-red-600",
        className
      )}
      title={NAME[v] ?? v}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={3} />
      {ABBR[v] ?? v}
    </span>
  );
}
