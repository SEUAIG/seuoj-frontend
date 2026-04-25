import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Loader2,
  Pencil,
  FileText,
  FileArchive,
  File,
  Megaphone,
  BookOpen,
  Calendar,
  Pin,
  ChevronRight,
  Info,
  Plus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { downloadFileWithAuth } from "@/services/file/uploadFile";
import { getAnnouncementPage } from "@/services/Class/getAnnouncementPage";
import { getAssignmentProgress } from "@/services/Assignment/getAssignmentProgress";
import type { ClassDetailData } from "@/services/Class/getClassDetail";
import ClassIntroEditorDialog from "./ClassIntroEditorDialog";
import CreateAnnouncementDialog from "./CreateAnnouncementDialog";
import CreateAssignmentDialog from "./CreateAssignmentDialog";

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

interface ClassHomepageProps {
  classId: number;
  classDetail: ClassDetailData;
  canEdit: boolean;
  onRefresh: () => void;
  onSwitchToOverview?: () => void;
  onSwitchToAnnouncements?: () => void;
  onSwitchToAssignments?: () => void;
}

export default function ClassHomepage({
  classId,
  classDetail,
  canEdit,
  onRefresh,
  onSwitchToOverview,
  onSwitchToAnnouncements,
  onSwitchToAssignments,
}: ClassHomepageProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const queryClient = useQueryClient();
  const nav = useNavigate();

  const { data: announcementData, isLoading: isAnnouncementLoading } =
    useQuery({
      queryKey: ["classAnnouncements", classId, 1, 5],
      queryFn: () => getAnnouncementPage(classId, { current: 1, size: 5 }),
      enabled: !!classId,
    });

  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: ["assignmentProgress", classId],
    queryFn: () => getAssignmentProgress(classId),
    enabled: !!classId,
  });

  const announcements = announcementData?.data?.records || [];
  const assignments = progressData?.data || [];

  return (
    <div className="flex gap-6">
      {/* Left: Introduction */}
      <div className="flex-1 min-w-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              班级介绍
            </CardTitle>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditorOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                编辑
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {classDetail.introduction ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer>{classDetail.introduction}</MarkdownRenderer>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm py-8 text-center">
                暂未设置班级介绍
                {canEdit && (
                  <Button
                    variant="link"
                    className="ml-2 h-auto p-0"
                    onClick={() => setIsEditorOpen(true)}
                  >
                    点击添加
                  </Button>
                )}
              </div>
            )}

            {/* Attachments */}
            {classDetail.intro_attachments &&
              classDetail.intro_attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">附件</h4>
                  <div className="space-y-1.5">
                    {classDetail.intro_attachments.map((att) => (
                      <a
                        key={att.id}
                        href="#"
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          void downloadFileWithAuth(att.file_path, att.file_name);
                        }}
                      >
                        {getFileIcon(att.file_name)}
                        <span className="flex-1 text-sm truncate">
                          {att.file_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(att.file_size)}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Sidebar */}
      <div className="w-80 shrink-0 space-y-4">
        {/* Assignments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" />
                作业
              </CardTitle>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setIsCreateAssignmentOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  新建
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isProgressLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无作业
              </p>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 5).map((a) => (
                  <div
                    key={a.assignment_id}
                    className="p-2.5 rounded-md border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => nav(`/class/${classId}/assignment/${a.assignment_id}`)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm truncate flex-1">
                        {a.title}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {a.problem_count}题
                      </span>
                    </div>
                    {a.deadline && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(a.deadline), "MM/dd HH:mm")}
                      </div>
                    )}
                    <div className="mt-1.5">
                      <Progress value={a.avg_completion_rate} className="h-1.5" />
                    </div>
                    <div className="text-right mt-0.5">
                      <span className="text-xs font-medium">
                        {a.avg_completion_rate}%
                      </span>
                    </div>
                  </div>
                ))}
                {assignments.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => onSwitchToAssignments?.()}
                  >
                    查看全部
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4" />
                公告
              </CardTitle>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setIsCreateAnnouncementOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  新建
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isAnnouncementLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无公告
              </p>
            ) : (
              <div className="space-y-2.5">
                {announcements.map((ann) => (
                  <div
                    key={ann.announcement_id}
                    className="p-2.5 rounded-md border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onSwitchToAnnouncements?.()}
                  >
                    <div className="flex items-center gap-1.5">
                      {ann.is_pinned && (
                        <Pin className="h-3 w-3 text-primary shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">
                        {ann.title}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(ann.created_at), "MM/dd HH:mm")}
                      {ann.created_by_nickname && (
                        <span className="ml-2">
                          {ann.created_by_nickname}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => onSwitchToAnnouncements?.()}
                >
                  查看全部
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Editor dialog */}
      {isEditorOpen && (
        <ClassIntroEditorDialog
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          classId={classId}
          currentIntroduction={classDetail.introduction}
          currentAttachments={classDetail.intro_attachments}
          onSuccess={() => {
            setIsEditorOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* Create announcement dialog */}
      {isCreateAnnouncementOpen && (
        <CreateAnnouncementDialog
          isOpen={isCreateAnnouncementOpen}
          onClose={() => setIsCreateAnnouncementOpen(false)}
          classId={classId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["classAnnouncements", classId] });
          }}
        />
      )}

      {/* Create assignment dialog */}
      {isCreateAssignmentOpen && (
        <CreateAssignmentDialog
          isOpen={isCreateAssignmentOpen}
          onClose={() => setIsCreateAssignmentOpen(false)}
          classId={classId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["assignmentProgress", classId] });
          }}
        />
      )}
    </div>
  );
}
