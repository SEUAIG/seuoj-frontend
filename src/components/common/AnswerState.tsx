import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  XCircle,
  Clock,
  CodeXml,
  AlertCircle,
  Cpu,
  Gavel,
  ServerCrash,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

export type States =
  | "Accepted"
  | "TimeLimitExceeded"
  | "WrongAnswer"
  | "CompileError"
  | "RuntimeError"
  | "MemoryLimitExceeded"
  | "JudgeError"
  | "SystemError"
  | "PartiallyAccepted"
  | "Skipped";

const iconMap: Record<string, LucideIcon> = {
  Accepted: CheckCircle,
  TimeLimitExceeded: Clock,
  WrongAnswer: XCircle,
  CompileError: CodeXml,
  RuntimeError: AlertCircle,
  MemoryLimitExceeded: Cpu,
  JudgeError: Gavel,
  SystemError: ServerCrash,
  PartiallyAccepted: CheckCircle, // Uses CheckCircle but will have different color
  Skipped: MoreHorizontal,
};

export const stateColorMap: Record<string, string> = {
  Accepted: "text-green-500",
  WrongAnswer: "text-red-500",
  TimeLimitExceeded: "text-yellow-500",
  CompileError: "text-blue-500",
  RuntimeError: "text-purple-500",
  MemoryLimitExceeded: "text-orange-500",
  JudgeError: "text-rose-600",
  SystemError: "text-red-700",
  PartiallyAccepted: "text-lime-500",
  Skipped: "text-gray-400",
};

const hoverStateColorMap: Record<string, string> = {
  Accepted: "group-hover:text-green-500",
  WrongAnswer: "group-hover:text-red-500",
  TimeLimitExceeded: "group-hover:text-yellow-500",
  CompileError: "group-hover:text-blue-500",
  RuntimeError: "group-hover:text-purple-500",
  MemoryLimitExceeded: "group-hover:text-orange-500",
  JudgeError: "group-hover:text-rose-600",
  SystemError: "group-hover:text-red-700",
  PartiallyAccepted: "group-hover:text-lime-500",
  Skipped: "group-hover:text-gray-400",
};
interface AnswerStateProps {
  state: string;
  active?: boolean;
}
export function AnswerStateNew({
  status,
  verdict,
}: {
  status: string;
  verdict?: string;
}) {
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1 text-gray-500">
        <MoreHorizontal className="h-4 w-4" />
        Pending
      </span>
    );
  }
  if (status === "Running") {
    return (
      <span className="inline-flex items-center gap-1 text-blue-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Running
      </span>
    );
  }
  if ((status === "Finished" || status === "Failed") && verdict) {
    return <AnswerState state={verdict} />;
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-500">
      <AlertCircle className="h-4 w-4" />
      Unknown
    </span>
  );
}

export default function AnswerState({ state, active }: AnswerStateProps) {
  // 确保state是有效的键 如果不是则默认显示 AlertCircle
  const Icon = iconMap[state] || AlertCircle;
  const baseColor = stateColorMap[state] || "text-gray-500";
  const hoverColor = hoverStateColorMap[state] || "group-hover:text-gray-500";
  let colorClass = "";
  if (active === undefined) {
    colorClass = baseColor;
  } else {
    colorClass = `${
      active ? baseColor : "text-muted-foreground"
    } ${hoverColor} transition-colors`;
  }
  return (
    <span className={`inline-flex items-center gap-1 ${colorClass}`}>
      <Icon className="h-4 w-4" />
      {state}
    </span>
  );
}
