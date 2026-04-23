import React, { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Loader2, Megaphone } from "lucide-react";
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
import AnnouncementCard from "./AnnouncementCard";
import ClassPagination from "./ClassPagination";
import CreateAnnouncementDialog from "./CreateAnnouncementDialog";
import {
  getAnnouncementPage,
  type AnnouncementItem,
} from "@/services/Class/getAnnouncementPage";
import { deleteAnnouncement } from "@/services/Class/deleteAnnouncement";

interface AnnouncementListProps {
  classId: number;
  canEdit?: boolean;
}

export default function AnnouncementList({
  classId,
  canEdit,
}: AnnouncementListProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const size = 10;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["classAnnouncements", classId, page, size],
    queryFn: () => getAnnouncementPage(classId, { current: page, size }),
    enabled: !!classId,
    placeholderData: keepPreviousData,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AnnouncementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const records = data?.data?.records || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / size);

  const handleDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteAnnouncement(classId, toDelete.announcement_id);
      if (res.code === 0) {
        toast.success("公告已删除");
        setToDelete(null);
        queryClient.invalidateQueries({ queryKey: ["classAnnouncements", classId] });
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
      {/* Header actions */}
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Megaphone className="h-4 w-4 mr-2" />
            发布公告
          </Button>
        </div>
      )}

      {/* Content */}
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
          <Megaphone className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-lg">暂无公告</p>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col gap-4 ${isFetching ? "opacity-60 transition-opacity" : ""}`}>
          <div className="space-y-3">
            {records.map((ann) => (
              <AnnouncementCard
                key={ann.announcement_id}
                announcement={ann}
                canEdit={canEdit}
                onEdit={() => {
                  /* TODO: edit dialog */
                }}
                onDelete={setToDelete}
              />
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

      {/* Create dialog */}
      {isCreateOpen && (
        <CreateAnnouncementDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          classId={classId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["classAnnouncements", classId] });
          }}
        />
      )}

      {/* Delete confirmation */}
      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除公告？</DialogTitle>
            <DialogDescription>
              此操作将删除公告 "{toDelete?.title}"，包括其所有附件。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={isDeleting}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
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
