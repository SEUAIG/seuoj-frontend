import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateAssignment,
  type UpdateAssignmentRequest,
} from "@/services/Assignment/updateAssignment";

function toLocalDatetimeStr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toISOOrUndefined(val: string): string | undefined {
  if (!val) return undefined;
  return new Date(val).toISOString();
}

interface AssignmentEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  assignmentId: number;
  currentData: {
    title: string;
    description: string | null;
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
    deadline: string | null;
    visible_from: string | null;
    visible_to: string | null;
  };
  onSuccess?: () => void;
}

export default function AssignmentEditDialog({
  isOpen,
  onClose,
  classId,
  assignmentId,
  currentData,
  onSuccess,
}: AssignmentEditDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "CLOSED">("DRAFT");
  const [deadline, setDeadline] = useState("");
  const [visibleFrom, setVisibleFrom] = useState("");
  const [visibleTo, setVisibleTo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(currentData.title || "");
      setDescription(currentData.description || "");
      setStatus(currentData.status || "DRAFT");
      setDeadline(toLocalDatetimeStr(currentData.deadline));
      setVisibleFrom(toLocalDatetimeStr(currentData.visible_from));
      setVisibleTo(toLocalDatetimeStr(currentData.visible_to));
    }
  }, [isOpen, currentData]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: UpdateAssignmentRequest = {
        title,
        description: description || undefined,
        status,
        deadline: toISOOrUndefined(deadline),
        visible_from: toISOOrUndefined(visibleFrom),
        visible_to: toISOOrUndefined(visibleTo),
      };
      return updateAssignment(classId, assignmentId, payload);
    },
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("作业更新成功");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "更新失败");
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "更新请求发生错误";
      toast.error(message);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>编辑作业</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">标题</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">描述</Label>
            <Textarea
              id="edit-description"
              placeholder="作业描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">草稿</SelectItem>
                <SelectItem value="PUBLISHED">已发布</SelectItem>
                <SelectItem value="CLOSED">已关闭</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-deadline">截止时间</Label>
            <Input
              id="edit-deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-visible-from">可见开始</Label>
              <Input
                id="edit-visible-from"
                type="datetime-local"
                value={visibleFrom}
                onChange={(e) => setVisibleFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-visible-to">可见结束</Label>
              <Input
                id="edit-visible-to"
                type="datetime-local"
                value={visibleTo}
                onChange={(e) => setVisibleTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!title.trim() || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
