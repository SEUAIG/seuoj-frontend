import { useState } from "react";
import { Button } from "@/components/ui/button";
import SkipSubmissionsDialog from "@/components/bussiness/SkipSubmissionsDialog";
import type { SkipOutcome } from "@/services/Submission/skipSubmissions";

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
};

/** 提交详情页：被跳过时的说明条，以及管理者的跳过 / 取消跳过按钮 */
export default function SkipNotice({
  skipped,
  originalVerdict,
  skipReason,
  canSkip,
  run,
  onDone,
}: {
  skipped?: boolean;
  originalVerdict?: string | null;
  skipReason?: string | null;
  canSkip?: boolean;
  run: (skipped: boolean, reason: string | undefined) => Promise<SkipOutcome>;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!skipped && !canSkip) return null;
  return (
    <div
      className={
        skipped
          ? "mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          : "mb-4 flex justify-end"
      }
    >
      {skipped && (
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-medium">这条提交已被跳过，不计入榜单和统计。</p>
          <p className="text-slate-500">
            {originalVerdict ? `原结果：${NAME[originalVerdict] ?? originalVerdict}` : "跳过时尚未出结果"}
            {skipReason && <span className="ml-3">原因：{skipReason}</span>}
          </p>
        </div>
      )}
      {canSkip && (
        <Button size="sm" variant={skipped ? "outline" : "ghost"} onClick={() => setOpen(true)}>
          {skipped ? "取消跳过" : "跳过这条提交"}
        </Button>
      )}
      <SkipSubmissionsDialog
        open={open}
        skipped={!skipped}
        target="这条提交"
        onOpenChange={setOpen}
        run={(reason) => run(!skipped, reason)}
        onDone={onDone}
      />
    </div>
  );
}
