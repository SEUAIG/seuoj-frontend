import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RejudgeOutcome } from "@/services/Submission/rejudge";

interface Props {
  open: boolean;
  /** 对话框标题里的对象，例如「3 条提交」「本场 A 题的全部提交」 */
  target: string;
  /** 额外说明，例如整题重测只影响哪些提交 */
  note?: string;
  onOpenChange: (open: boolean) => void;
  run: () => Promise<RejudgeOutcome>;
  onDone: () => void;
}

export default function RejudgeDialog({ open, target: targetProp, note: noteProp, onOpenChange, run, onDone }: Props) {
  const [submitting, setSubmitting] = useState(false);
  // 淡出动画期间调用方可能已清空选择，沿用打开时的文案
  const shown = useRef({ target: targetProp, note: noteProp });
  if (open) shown.current = { target: targetProp, note: noteProp };
  const { target, note } = shown.current;

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await run();
      if (r.queued === 0) {
        toast.info(r.busy > 0 ? `这些提交都在评测中，没有重测` : "没有需要重测的提交");
      } else {
        toast.success(
          `已加入重测 ${r.queued} 条${r.busy > 0 ? `（${r.busy} 条正在评测，未重测）` : ""}，排队 ${r.queueLength} 条`
        );
      }
      onOpenChange(false);
      onDone();
    } catch (err: unknown) {
      toast.error("重测失败：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>重测{target}</DialogTitle>
          <DialogDescription>
            结果会清空并重新评测，榜单和统计按新结果计算；评测期间这些提交不计入榜单。
            重测会逐条排队，不会挤占选手新提交的评测。被跳过的提交重测后仍保持跳过，正在评测的提交不会重测。
            {note ? ` ${note}` : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            确认重测
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
