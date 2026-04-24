import React, { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Loader2,
  BookOpen,
  Calendar,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClassPagination from "./ClassPagination";
import {
  getAssignmentPage,
  type AssignmentPageItem,
} from "@/services/Assignment/getAssignmentPage";
import { deleteAssignment } from "@/services/Assignment/deleteAssignment";

function computeDisplayStatus(status: string, visibleFrom?: string | null, visibleTo?: string | null): string {
  if (status === "DRAFT") return "DRAFT";
  const now = new Date();
  if (visibleFrom && now < new Date(visibleFrom)) return "NOT_OPEN";
  if (visibleTo && now > new Date(visibleTo)) return "CLOSED";
  return "PUBLISHED";
}

function statusBadge(status: string, visibleFrom?: string | null, visibleTo?: string | null) {
  const display = computeDisplayStatus(status, visibleFrom, visibleTo);
  switch (display) {
    case "DRAFT":
      return <Badge variant="secondary">草稿</Badge>;
    case "NOT_OPEN":
      return <Badge variant="secondary">未开放</Badge>;
    case "PUBLISHED":
      return <Badge variant="default">进行中</Badge>;
    case "CLOSED":
      return <Badge variant="outline">已关闭</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

interface AssignmentListProps {
  classId: number;
  canEdit?: boolean;
}

export default function AssignmentList({
  classId,
  canEdit,
}: AssignmentListProps) {
  const queryClient = useQueryClient();
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const size = 10;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["assignmentPage", classId, page, size],
    queryFn: () => getAssignmentPage(classId, { current: page, size }),
    enabled: !!classId,
    placeholderData: keepPreviousData,
  });

  const [toDelete, setToDelete] = useState<AssignmentPageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const records = data?.data?.records || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / size);

  const handleDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteAssignment(classId, toDelete.id);
      if (res.code === 0) {
        toast.success("作业已删除");
        setToDelete(null);
        queryClient.invalidateQueries({ queryKey: ["assignmentPage", classId] });
        queryClient.invalidateQueries({ queryKey: ["classOverview", classId] });
      } else {
        toast.error(res.message || "删除失败");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "删除请求失败";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center text-red-500 min-h-[300px]">
          加载失败: {error instanceof Error ? error.message : "未知错误"}
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-center bg-muted/10 rounded-md">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-lg">暂无作业</p>
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col ${
            isFetching ? "opacity-60 transition-opacity" : ""
          }`}
        >
          <div className="grid gap-3">
            {records.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() =>
                  nav(`/class/${classId}/assignment/${assignment.id}`)
                }
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-base group-hover:text-primary transition-colors truncate">
                        {assignment.title}
                      </h4>
                      {statusBadge(assignment.status, assignment.visible_from, assignment.visible_to)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {assignment.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          截止:{" "}
                          {format(
                            new Date(assignment.deadline),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </span>
                      )}
                      {assignment.description && (
                        <span className="truncate max-w-[300px]">
                          {assignment.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setToDelete(assignment);
                      }}
                      title="删除作业"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="p-4 mt-auto flex justify-center">
              <ClassPagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除作业？</DialogTitle>
            <DialogDescription>
              此操作将删除作业 "{toDelete?.title}"，包括其所有关联的题目数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setToDelete(null)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
