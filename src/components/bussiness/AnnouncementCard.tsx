import React from "react";
import { format } from "date-fns";
import {
  Pin,
  FileText,
  FileArchive,
  File,
  Download,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnnouncementItem, AttachmentItem } from "@/services/Class/getAnnouncementPage";
import { downloadFileWithAuth } from "@/services/file/uploadFile";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

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

interface AnnouncementCardProps {
  announcement: AnnouncementItem;
  canEdit?: boolean;
  onEdit?: (announcement: AnnouncementItem) => void;
  onDelete?: (announcement: AnnouncementItem) => void;
}

export default function AnnouncementCard({
  announcement,
  canEdit,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  return (
    <Card
      className={`${
        announcement.is_pinned ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {announcement.is_pinned && (
                <Pin className="h-4 w-4 text-primary shrink-0" />
              )}
              <h3 className="text-base font-semibold truncate">
                {announcement.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {announcement.created_by_nickname || announcement.created_by_username}
              </span>
              <span>
                {format(new Date(announcement.created_at), "yyyy-MM-dd HH:mm")}
              </span>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit?.(announcement)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete?.(announcement)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {announcement.content && (
          <div className="mt-3 prose prose-sm dark:prose-invert max-w-none text-foreground">
            <MarkdownRenderer>{announcement.content}</MarkdownRenderer>
          </div>
        )}

        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              附件 ({announcement.attachments.length})
            </div>
            <div className="space-y-1.5">
              {announcement.attachments.map((att: AttachmentItem) => (
                <a
                  key={att.id}
                  href="#"
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
                  onClick={(e) => {
                    e.preventDefault();
                    void downloadFileWithAuth(att.file_path, att.file_name);
                  }}
                >
                  {getFileIcon(att.file_name)}
                  <span className="flex-1 text-sm truncate group-hover:text-primary transition-colors">
                    {att.file_name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatFileSize(att.file_size)}
                  </span>
                  <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
