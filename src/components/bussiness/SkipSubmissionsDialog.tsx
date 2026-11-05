import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SkipOutcome } from "@/services/Submission/skipSubmissions";

interface Props {
  open: boolean;
  /** true：跳过；false：取消跳过 */
  skipped: boolean;
  /** 对话框里描述对象，例如「3 条提交」「alice 本场的全部提交」 */
  target: string;
  onOpenChange: (open: boolean) => void;
  run: (reason: string | undefined) => Promise<SkipOutcome>;
  onDone: () => void;
}

export default function SkipSubmissionsDialog({ open, skipped: skippedProp, target: targetProp, onOpenChange, run, onDone }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // 关闭的淡出动画期间调用方可能已清空选择，沿用打开时的文案，避免标题闪成“0 条”
  const shown = useRef({ skipped: skippedProp, target: targetProp });
  if (open) shown.current = { skipped: skippedProp, target: targetProp };
  const { skipped, target } = shown.current;
  const verb = skipped ? "跳过" : "取消跳过";

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const result = await run(skipped ? reason.trim() || undefined : undefined);
      const unchanged = result.matched - result.changed;
      toast.success(`已${verb} ${result.changed} 条提交${unchanged > 0 ? `（${unchanged} 条本来就是该状态）` : ""}`);
      onOpenChange(false);
      onDone();
    } catch (err: unknown) {
      toast.error(`${verb}失败：` + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {verb}
            {target}
          </DialogTitle>
          <DialogDescription>
            {skipped
              ? "被跳过的提交仍保留在提交记录里，结果显示为 Skipped，不再计入榜单、题目通过数和各类统计。可以随时取消。"
              : "取消后这些提交恢复原来的结果，重新计入榜单和统计。"}
          </DialogDescription>
        </DialogHeader>
        {skipped && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="skip-reason">
              原因（可不填）
            </label>
            <Input
              id="skip-reason"
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例如：与他人代码雷同"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button variant={skipped ? "destructive" : "default"} onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            确认{verb}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
