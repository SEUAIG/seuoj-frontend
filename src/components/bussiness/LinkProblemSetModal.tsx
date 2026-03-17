import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon, BookOpen } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { linkProblemSet } from "@/services/Class/linkProblemSet";
import { getProblemSetPage } from "@/services/ProblemSet/getProblemSetPage";
import { Badge } from "@/components/ui/badge";

interface LinkProblemSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export default function LinkProblemSetModal({
  isOpen,
  onClose,
  classId,
}: LinkProblemSetModalProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const size = 5;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["problemSetPage", page, size],
    queryFn: () => getProblemSetPage({ current: page, size }),
    placeholderData: keepPreviousData,
    enabled: isOpen,
  });

  const records = data?.records || [];
  const totalPages = Math.ceil((data?.total || 0) / size);

  const linkMutation = useMutation<any, Error, string>({
    mutationFn: (problemSetId: string) => linkProblemSet(classId, problemSetId),
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("成功关联题单");
        queryClient.invalidateQueries({
          queryKey: ["classLinkedProblemSets", classId],
        });
        onClose();
      } else {
        toast.error(res.message || "关联失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "关联请求发生错误");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>关联题单</DialogTitle>
          <DialogDescription>选择要关联到当前班级的题单。</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border rounded-md min-h-[300px] mt-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              没有找到相关题单
            </div>
          ) : (
            <div
              className={`divide-y ${
                isFetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              {records.map((ps) => (
                <div
                  key={ps.problem_set_public_id}
                  className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium truncate" title={ps.title}>
                        {ps.title}
                      </h4>
                      <Badge
                        variant={ps.is_public ? "secondary" : "outline"}
                        className="text-[10px] h-5 px-1.5"
                      >
                        {ps.is_public ? "公开" : "私有"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      题目数: {ps.problem_count || 0}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      linkMutation.mutate(ps.problem_set_public_id!)
                    }
                    disabled={linkMutation.isPending}
                  >
                    {linkMutation.isPending &&
                    linkMutation.variables === ps.problem_set_public_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-1" />
                        关联
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
