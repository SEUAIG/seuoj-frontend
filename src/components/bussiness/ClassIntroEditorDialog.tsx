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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateClass } from "@/services/Class/updateClass";
import { uploadFile } from "@/services/file/uploadFile";
import { useSaveShortcut } from "@/hooks/useSaveShortcut";
import type { ClassIntroAttachment } from "@/services/Class/getClassDetail";

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
  if (
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar" ||
    ext === "gz"
  ) {
    return <FileArchive className="h-4 w-4 text-amber-500" />;
  }
  return <File className="h-4 w-4 text-muted-foreground" />;
}

interface UploadedFile {
  file_path: string;
  file_name: string;
  file_size: number;
}

interface ClassIntroEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  currentIntroduction: string | null;
  currentAttachments: ClassIntroAttachment[];
  onSuccess: () => void;
}

export default function ClassIntroEditorDialog({
  isOpen,
  onClose,
  classId,
  currentIntroduction,
  currentAttachments,
  onSuccess,
}: ClassIntroEditorDialogProps) {
  const [introduction, setIntroduction] = useState(currentIntroduction ?? "");
  const [attachments, setAttachments] = useState<UploadedFile[]>(
    currentAttachments.map((a) => ({
      file_path: a.file_path,
      file_name: a.file_name,
      file_size: a.file_size,
    }))
  );
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>(
    []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingAttachments = currentAttachments;

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
    const existing = existingAttachments.find(
      (e) => e.file_path === att.file_path && e.file_name === att.file_name
    );
    if (existing) {
      setRemovedAttachmentIds((prev) => [...prev, existing.id]);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newAttachments = attachments.filter(
        (a) =>
          !existingAttachments.some(
            (e) => e.file_path === a.file_path && e.file_name === a.file_name
          )
      );

      const res = await updateClass(classId, {
        introduction: introduction || "",
        add_intro_attachments:
          newAttachments.length > 0 ? newAttachments : undefined,
        remove_intro_attachment_ids:
          removedAttachmentIds.length > 0 ? removedAttachmentIds : undefined,
      });

      if (res.code === 0) {
        toast.success("班级介绍已更新");
        onClose();
        onSuccess();
      } else {
        toast.error(res.message || "更新失败");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "更新失败";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useSaveShortcut(handleSubmit, isOpen && !isSubmitting && !isUploading);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑班级介绍</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">
              介绍内容 (Markdown)
            </label>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
              placeholder="输入班级介绍（支持 Markdown）"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
            />
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
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? (
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
