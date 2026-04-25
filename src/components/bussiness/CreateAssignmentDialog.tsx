import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createAssignment } from "@/services/Assignment/createAssignment";
import { getProblemSetPage } from "@/services/ProblemSet/getProblemSetPage";
import { Badge } from "@/components/ui/badge";

interface CreateAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  onSuccess?: () => void;
}

export default function CreateAssignmentDialog({
  isOpen,
  onClose,
  classId,
  onSuccess,
}: CreateAssignmentDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedProblemSetId, setSelectedProblemSetId] = useState<
    number | null
  >(null);
  const [psPage, setPsPage] = useState(1);
  const [showPsSelector, setShowPsSelector] = useState(false);
  const psSize = 5;

  const { data: psData, isLoading: isPsLoading } = useQuery({
    queryKey: ["problemSetPage", psPage, psSize],
    queryFn: () => getProblemSetPage({ current: psPage, size: psSize }),
    placeholderData: keepPreviousData,
    enabled: isOpen && showPsSelector,
  });

  const psRecords = psData?.records || [];
  const psTotalPages = Math.ceil((psData?.total || 0) / psSize);

  const createMutation = useMutation({
    mutationFn: () =>
      createAssignment(classId, {
        title,
        description: description || undefined,
        deadline: deadline || undefined,
        problem_ids: selectedProblemSetId ? undefined : [],
      }),
    onSuccess: async (res) => {
      if (res.code === 0) {
        const assignmentId = res.data.assignment_id;
        if (selectedProblemSetId) {
          try {
            const { importFromProblemSet } = await import(
              "@/services/Assignment/importFromProblemSet"
            );
            await importFromProblemSet(classId, assignmentId, {
              problem_set_id: selectedProblemSetId,
            });
          } catch {
            toast.error("题单导入失败，但作业已创建");
          }
        }
        toast.success("作业创建成功");
        queryClient.invalidateQueries({
          queryKey: ["assignmentProgress", classId],
        });
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.message || "创建失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "创建请求发生错误");
    },
  });

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setSelectedProblemSetId(null);
    setShowPsSelector(false);
    onClose();
  };

  const selectedPsName = psRecords.find(
    (ps) => ps.problem_set_id === selectedProblemSetId
  )?.title;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新建作业</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="输入作业标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              placeholder="输入作业描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">截止时间</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>从题单导入题目（可选）</Label>
            {selectedProblemSetId && selectedPsName ? (
              <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{selectedPsName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    setSelectedProblemSetId(null);
                    setShowPsSelector(false);
                  }}
                >
                  取消选择
                </Button>
              </div>
            ) : showPsSelector ? (
              <div className="border rounded-md">
                {isPsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : psRecords.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    没有找到题单
                  </div>
                ) : (
                  <div className="divide-y max-h-[240px] overflow-y-auto">
                    {psRecords.map((ps) => (
                      <div
                        key={ps.problem_set_id}
                        className="p-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedProblemSetId(ps.problem_set_id!);
                          setShowPsSelector(false);
                        }}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium truncate">
                              {ps.title}
                            </span>
                            <Badge
                              variant={ps.is_public ? "secondary" : "outline"}
                              className="text-[10px] h-4 px-1"
                            >
                              {ps.is_public ? "公开" : "私有"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {ps.problem_count || 0} 题
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {psTotalPages > 1 && (
                  <div className="flex justify-between items-center p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={() => setPsPage((p) => Math.max(1, p - 1))}
                      disabled={psPage === 1}
                    >
                      上一页
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {psPage} / {psTotalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={() =>
                        setPsPage((p) => Math.min(psTotalPages, p + 1))
                      }
                      disabled={psPage === psTotalPages}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPsSelector(true)}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                选择题单
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!title.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                创建中...
              </>
            ) : (
              "创建"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
