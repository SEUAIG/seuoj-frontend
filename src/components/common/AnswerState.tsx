import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  XCircle,
  Clock,
  CodeXml,
  AlertCircle,
  Cpu,
} from "lucide-react";

export type States =
  | "Accepted"
  | "Time Limit Exceeded"
  | "Wrong Answer"
  | "Compile Error"
  | "Runtime Error"
  | "Memory Limit Exceeded";

const iconMap: Record<States, LucideIcon> = {
  Accepted: CheckCircle,
  "Time Limit Exceeded": Clock,
  "Wrong Answer": XCircle,
  "Compile Error": CodeXml,
  "Runtime Error": AlertCircle,
  "Memory Limit Exceeded": Cpu,
};

export const stateColorMap: Record<States, string> = {
  "Accepted": "text-green-500",
  "Wrong Answer": "text-red-500",
  "Time Limit Exceeded": "text-yellow-500",
  "Compile Error": "text-blue-500",
  "Runtime Error": "text-purple-500",
  "Memory Limit Exceeded": "text-orange-500",
};

export default function AnswerState({
  state,
  className,
}: {
  state: States;
  className?: string;
}) {
  const Icon = iconMap[state];

  return (
    <span
      className={["inline-flex items-center gap-1", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon className="h-4 w-4" />
      {state}
    </span>
  );
}
