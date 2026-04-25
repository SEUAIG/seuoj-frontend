import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useQueryToGetProblemSetDetail from "@/hooks/useQueryToGetProblemSetDetail";
import { deleteProblemSet } from "@/services/ProblemSet/deleteProblemSet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Settings, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { toast } from "sonner";

export default function ProblemSetDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: detail,
    isLoading: detailLoading,
    isError,
    error,
  } = useQueryToGetProblemSetDetail(Number(id));

  const canEdit = detail?.can_write ?? false;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (detailLoading) {
    return (
      <div className="w-4/5 mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="w-4/5 mx-auto py-6 text-center text-muted-foreground">
        <div className="text-xl font-semibold mb-2">加载题单信息失败</div>
        <p>{error instanceof Error ? error.message : "未知错误"}</p>
        <Button variant="outline" className="mt-4" onClick={() => nav(-1)}>
          返回上一页
        </Button>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen">
      <Helmet>
        <title>
          {detail.title ? `${detail.title} - 题单详情` : "题单详情"} - SeuOJ
        </title>
      </Helmet>
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{detail.title}</h1>
          {detail.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2">
              {detail.description}
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => nav(`/problemset/${id}/edit`)}>
              <Settings className="mr-2 h-4 w-4" />
              编辑题单
            </Button>
            <Button
              variant="outline"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除题单
            </Button>
          </div>
        )}
      </div>

      {/* 基础信息卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6 items-center mb-6 border-b pb-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">题单ID</div>
              <div className="font-mono text-sm">{id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">内部ID</div>
              <div className="font-mono text-sm">
                {detail.problem_set_id || "-"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">公开性</div>
              <Badge
                variant={detail.is_public ? "outline" : "secondary"}
                className={
                  detail.is_public
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : ""
                }
              >
                {detail.is_public ? "公开" : "私有"}
              </Badge>
            </div>
          </div>

          {/* 描述 */}
          {detail.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">题单描述</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-4 rounded-lg">
                <MarkdownRenderer>{detail.description}</MarkdownRenderer>
              </div>
            </div>
          )}

          {/* 题目列表 - 来自详情API */}
          {detail.problem_list && detail.problem_list.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">题目列表</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[80px]">序号</TableHead>
                      <TableHead className="w-[150px]">题号</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead className="w-[100px] text-right">
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.problem_list.map((problem) => (
                      <TableRow key={problem.pid} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {problem.sort_order}
                        </TableCell>
                        <TableCell className="font-mono">
                          <span
                            onClick={() =>
                              nav(`/problemsLibrary/${problem.pid}?problem_set_id=${id}`)
                            }
                            className="hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                          >
                            {problem.pid}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            onClick={() =>
                              nav(`/problemsLibrary/${problem.pid}?problem_set_id=${id}`)
                            }
                            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                          >
                            {problem.title}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              nav(`/problemsLibrary/${problem.pid}?problem_set_id=${id}`)
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              暂无题目
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除题单？</DialogTitle>
            <DialogDescription>
              此操作将删除题单 "{detail.title}"，包括其所有关联的题目数据。此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  const res = await deleteProblemSet(Number(id));
                  if (res.code === 0) {
                    toast.success("题单已删除");
                    await queryClient.invalidateQueries({
                      queryKey: ["problemSetPage"],
                    });
                    nav("/problemset");
                  } else {
                    toast.error(res.message || "删除失败");
                  }
                } catch (error: any) {
                  toast.error(error.message || "删除请求发生错误");
                } finally {
                  setIsDeleting(false);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
