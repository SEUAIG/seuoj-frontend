import React, { useState, useRef } from "react";
import {
  Loader2,
  Upload,
  X,
  FileText,
  FileArchive,
  File,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAnnouncement } from "@/services/Class/createAnnouncement";
import { updateAnnouncement } from "@/services/Class/updateAnnouncement";
import { uploadFile } from "@/services/file/uploadFile";
import type { AnnouncementItem } from "@/services/Class/getAnnouncementPage";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "doc" || ext === "docx" || ext === "txt") {
    return <FileText className="h-4 w-4 text-blue-500" />;
  }
  if (ext === "zip" || ext === "rar" || ext === "7z" || ext === "tar" || ext === "gz") {
    return <FileArchive className="h-4 w-4 text-amber-500" />;
  }
  return <File className="h-4 w-4 text-muted-foreground" />;
}

interface UploadedFile {
  file_path: string;
  file_name: string;
  file_size: number;
}

interface CreateAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  assignmentId?: number;
  /** When provided, dialog operates in edit mode */
  editAnnouncement?: AnnouncementItem;
  onSuccess?: () => void;
}

export default function CreateAnnouncementDialog({
  isOpen,
  onClose,
  classId,
  editAnnouncement,
  onSuccess,
}: CreateAnnouncementDialogProps) {
  const isEdit = !!editAnnouncement;
  const [title, setTitle] = useState(editAnnouncement?.title ?? "");
  const [content, setContent] = useState(editAnnouncement?.content ?? "");
  const [isPinned, setIsPinned] = useState(editAnnouncement?.is_pinned ?? false);
  const [attachments, setAttachments] = useState<UploadedFile[]>(
    editAnnouncement?.attachments?.map((a) => ({
      file_path: a.file_path,
      file_name: a.file_name,
      file_size: a.file_size,
    })) ?? []
  );
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing attachments (from server) vs newly added ones
  const existingAttachments = editAnnouncement?.attachments ?? [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadFile(file);
        if (res.code === 0) {
          setAttachments((prev) => [
            ...prev,
            {
              file_path: res.data.path,
              file_name: res.data.name,
              file_size: res.data.size,
            },
          ]);
        } else {
          toast.error(`上传 ${file.name} 失败: ${res.message}`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "上传失败";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (index: number) => {
    const att = attachments[index];
    // If this attachment matches an existing server attachment, record its ID for removal
    const existing = existingAttachments.find(
      (e) => e.file_path === att.file_path && e.file_name === att.file_name
    );
    if (existing) {
      setRemovedAttachmentIds((prev) => [...prev, existing.id]);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("标题不能为空");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && editAnnouncement) {
        // Distinguish newly added attachments from existing ones
        const newAttachments = attachments.filter(
          (a) =>
            !existingAttachments.some(
              (e) => e.file_path === a.file_path && e.file_name === a.file_name
            )
        );
        const res = await updateAnnouncement(classId, editAnnouncement.announcement_id, {
          title: title.trim(),
          content: content || undefined,
          is_pinned: isPinned,
          add_attachments: newAttachments.length > 0 ? newAttachments : undefined,
          remove_attachment_ids: removedAttachmentIds.length > 0 ? removedAttachmentIds : undefined,
        });
        if (res.code === 0) {
          toast.success("公告已更新");
          onClose();
          onSuccess?.();
        } else {
          toast.error(res.message || "更新失败");
        }
      } else {
        const res = await createAnnouncement(classId, {
          title: title.trim(),
          content: content || undefined,
          is_pinned: isPinned,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        if (res.code === 0) {
          toast.success("公告发布成功");
          onClose();
          onSuccess?.();
        } else {
          toast.error(res.message || "发布失败");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : isEdit ? "更新失败" : "发布失败";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑公告" : "发布公告"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">标题</label>
            <Input
              placeholder="请输入公告标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              内容 (Markdown)
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="输入公告内容（支持 Markdown）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_pinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="is_pinned" className="text-sm">
              置顶此公告
            </label>
          </div>

          {/* File upload */}
          <div>
            <label className="text-sm font-medium mb-1 block">附件</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "上传中..." : "选择文件"}
            </Button>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                  >
                    {getFileIcon(att.file_name)}
                    <span className="flex-1 text-sm truncate">
                      {att.file_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(att.file_size)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeAttachment(idx)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "保存中..." : "发布中..."}
              </>
            ) : (
              isEdit ? "保存" : "发布"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
