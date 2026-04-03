import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Trash2, UserPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { getClassPage, ClassItem } from "@/services/Class/getClassPage";
import { deleteClass } from "@/services/Class/deleteClass";
import { joinClass } from "@/services/Class/joinClass";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClassPagination from "../bussiness/ClassPagination";
import UpdateClassModal from "../bussiness/UpdateClassModal";
import CreateClassModal from "../bussiness/CreateClassModal";
import { toast } from "sonner";

export default function ClassPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const size = parseInt(searchParams.get("size") || "20");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [joiningClassId, setJoiningClassId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["classPage", page, size],
    queryFn: () => getClassPage({ current: page, size }),
    placeholderData: keepPreviousData,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), size: size.toString() });
  };

  const handleUpdateClick = (e: React.MouseEvent, item: ClassItem) => {
    e.stopPropagation();
    setSelectedClass(item);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: ClassItem) => {
    e.stopPropagation();
    setClassToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteClass(classToDelete.class_public_id);
      if (res.code === 0) {
        toast.success("班级删除成功");
        setIsDeleteDialogOpen(false);
        setClassToDelete(null);
        refetch(); // 重新加载列表
      } else {
        toast.error(res.message || "删除失败");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "删除请求发生错误");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleJoinClick = async (e: React.MouseEvent, item: ClassItem) => {
    e.stopPropagation();
    setJoiningClassId(item.class_public_id);
    try {
      const res = await joinClass(item.class_public_id);
      if (res.code === 0) {
        toast.success(`成功加入班级: ${item.name}`);
        // 加入成功后清空班级详情成员缓存并刷新列表
        queryClient.invalidateQueries({ queryKey: ["classMemberPage", item.class_public_id] });
        refetch();
      } else {
        toast.error(res.message || "加入失败");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "加入请求发生错误");
    } finally {
      setJoiningClassId(null);
    }
  };

  const records = data?.data?.records || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / size);

  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>班级 - SeuOJ</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">班级</div>
          <div className="text-sm text-muted-foreground mt-1">
            浏览和管理班级列表
          </div>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建班级
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          加载失败: {error instanceof Error ? error.message : "未知错误"}
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground text-lg mb-4">
            暂无班级数据，你可以尝试创建一个新班级。
          </p>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${
              isFetching ? "opacity-60 transition-opacity" : ""
            }`}
          >
            {records.map((item) => (
              <Card
                key={item.class_public_id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => nav(`/class/${item.class_public_id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle
                      className="text-xl truncate mr-2"
                      title={item.name}
                    >
                      {item.name}
                    </CardTitle>
                    <Badge variant={item.is_public ? "secondary" : "outline"}>
                      {item.is_public ? "公开" : "私有"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 min-h-[4.5em]">
                    {item.description || "暂无描述"}
                  </CardDescription>
                </CardContent>
                {isAuthenticated && (
                <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={(e) => handleUpdateClick(e, item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    更新
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={(e) => handleDeleteClick(e, item)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={(e) => handleJoinClick(e, item)}
                    disabled={joiningClassId === item.class_public_id}
                  >
                    {joiningClassId === item.class_public_id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-1" />
                    )}
                    加入
                  </Button>
                </CardFooter>
                )}
              </Card>
            ))}
          </div>
          <ClassPagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <UpdateClassModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        classItem={selectedClass}
      />

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除该班级？</DialogTitle>
            <DialogDescription>
              此操作无法撤销。这将永久删除班级 "{classToDelete?.name}"
              及相关数据。
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
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
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
