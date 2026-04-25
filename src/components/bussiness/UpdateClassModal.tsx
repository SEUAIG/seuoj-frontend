import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Trash2, UserPlus, Search, Shield } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateClass } from "@/services/Class/updateClass";
import { ClassItem } from "@/services/Class/getClassPage";
import { useSaveShortcut } from "@/hooks/useSaveShortcut";
import {
  listPermissions,
  PermissionItem,
} from "@/services/Permission/listPermissions";
import { grantPermission } from "@/services/Permission/grantPermission";
import { revokePermission } from "@/services/Permission/revokePermission";
import useQueryToGetUserPage from "@/hooks/useQueryToGetUserPage";

const formSchema = z.object({
  name: z.string().min(1, "班级名称不能为空"),
  description: z.string().optional().default(""),
  is_public: z.boolean().default(false),
});

type ClassFormValues = z.infer<typeof formSchema>;

interface UpdateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: ClassItem | null;
}

export default function UpdateClassModal({
  isOpen,
  onClose,
  classItem,
}: UpdateClassModalProps) {
  const queryClient = useQueryClient();
  const [isSavingPublic, setIsSavingPublic] = useState(false);
  const currentUsername = useSelector(
    (state: RootState) => state.auth.user?.username
  );

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(formSchema) as any,
    values: {
      name: classItem?.name || "",
      description: classItem?.description || "",
      is_public: classItem?.is_public || false,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ClassFormValues) => {
      if (!classItem) throw new Error("班级信息不存在");
      return updateClass(classItem.class_id, {
        name: values.name,
        description: values.description || "",
        is_public: values.is_public,
      });
    },
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("班级更新成功");
        queryClient.invalidateQueries({ queryKey: ["classPage"] });
        onClose();
      } else {
        toast.error(res.message || "更新失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "更新请求发生错误");
    },
  });

  const onSubmit: any = (values: ClassFormValues) => {
    updateMutation.mutate(values);
  };

  useSaveShortcut(() => form.handleSubmit(onSubmit)(), isOpen && !updateMutation.isPending);

  // --- Permission management ---
  const classId = classItem?.class_id;

  const {
    data: permData,
    isLoading: isPermLoading,
    refetch: refetchPerms,
  } = useQuery({
    queryKey: ["classPermissions", classId],
    queryFn: () => listPermissions("CLASS", classId!),
    enabled: isOpen && !!classId,
  });

  const writePermissions =
    permData?.code === 0
      ? permData.data.filter((p) => p.permission === "WRITE")
      : [];

  // Add permission states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addKeyword, setAddKeyword] = useState("");
  const [addSearchUsername, setAddSearchUsername] = useState("");
  const [addPage, setAddPage] = useState(1);
  const [userToGrant, setUserToGrant] = useState<{
    user_id: number;
    nickname: string | null;
    username: string;
  } | null>(null);

  // Remove permission states
  const [permToRevoke, setPermToRevoke] = useState<PermissionItem | null>(null);
  const [selfRevokeConfirmed, setSelfRevokeConfirmed] = useState(false);

  const { data: userPageData, isLoading: isUserLoading } =
    useQueryToGetUserPage(
      { current: addPage, size: 5, username: addSearchUsername || undefined },
      isAddOpen
    );

  const userRecords = userPageData?.records || [];

  const grantMutation = useMutation({
    mutationFn: (targetUserId: number) =>
      grantPermission({
        resourceType: "CLASS",
        resourceId: String(classId),
        targetUserId: String(targetUserId),
        permission: "WRITE",
      }),
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("已授予写权限");
        refetchPerms();
        setUserToGrant(null);
        setIsAddOpen(false);
      } else {
        toast.error(res.message || "授权失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "授权请求发生错误");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (targetUserId: number) =>
      revokePermission({
        resourceType: "CLASS",
        resourceId: String(classId),
        targetUserId: String(targetUserId),
        permission: "WRITE",
      }),
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("已移除写权限");
        refetchPerms();
        setPermToRevoke(null);
        setSelfRevokeConfirmed(false);
      } else {
        toast.error(res.message || "移除权限失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "移除权限请求发生错误");
    },
  });

  const handleRevokeClick = (perm: PermissionItem) => {
    setPermToRevoke(perm);
    setSelfRevokeConfirmed(false);
  };

  const confirmRevoke = () => {
    if (!permToRevoke) return;
    const isSelf = permToRevoke.username === currentUsername;
    if (isSelf && !selfRevokeConfirmed) {
      setSelfRevokeConfirmed(true);
      return;
    }
    revokeMutation.mutate(permToRevoke.user_id);
  };

  const handleAddSearch = () => {
    setAddSearchUsername(addKeyword);
    setAddPage(1);
  };

  const displayName = (p: { nickname: string | null; username: string }) =>
    p.nickname || p.username;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>更新班级信息</DialogTitle>
            <DialogDescription>
              修改班级的基本信息，点击保存以提交更改。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班级名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入班级名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>班级描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入班级描述（可选）"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">公开班级</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        disabled={isSavingPublic}
                        onCheckedChange={async (checked) => {
                          field.onChange(checked);
                          if (!classItem) return;
                          setIsSavingPublic(true);
                          try {
                            const res = await updateClass(classItem.class_id, { is_public: checked });
                            if (res.code !== 0) {
                              throw new Error(res.message || "更新失败");
                            }
                            toast.success("公开状态已更新");
                            queryClient.invalidateQueries({ queryKey: ["classPage"] });
                          } catch (error: any) {
                            field.onChange(!checked);
                            toast.error(error.message || "更新失败");
                          } finally {
                            setIsSavingPublic(false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updateMutation.isPending}
                >
                  取消
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  保存更改
                </Button>
              </div>
            </form>
          </Form>

          {/* Write permission management */}
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                写权限管理
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddOpen(true);
                  setAddKeyword("");
                  setAddSearchUsername("");
                  setAddPage(1);
                }}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                添加协作者
              </Button>
            </div>

            {isPermLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : writePermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无显式写权限者
              </p>
            ) : (
              <div className="space-y-2">
                {writePermissions.map((perm) => {
                  const isSelf = perm.username === currentUsername;
                  return (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {displayName(perm)}
                          {isSelf && (
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              (我)
                            </span>
                          )}
                        </p>
                        {perm.nickname && (
                          <p className="text-xs text-muted-foreground">
                            {perm.username}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => handleRevokeClick(perm)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add collaborator dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>添加协作者</DialogTitle>
            <DialogDescription>
              搜索用户并授予班级写权限。
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-2">
            <Input
              placeholder="搜索用户名..."
              value={addKeyword}
              onChange={(e) => setAddKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSearch()}
            />
            <Button variant="outline" size="icon" onClick={handleAddSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-2 min-h-[200px]">
            {isUserLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userRecords.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                未找到用户
              </div>
            ) : (
              <div className="space-y-2">
                {userRecords.map((user) => {
                  const alreadyHas = writePermissions.some(
                    (p) => p.user_id === user.user_id
                  );
                  return (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {user.nickname || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      {alreadyHas ? (
                        <span className="text-xs text-muted-foreground px-2">
                          已有权限
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setUserToGrant({
                              user_id: user.user_id,
                              nickname: user.nickname,
                              username: user.username,
                            })
                          }
                          disabled={grantMutation.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          授权
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant confirmation dialog */}
      <Dialog
        open={!!userToGrant}
        onOpenChange={(open) => !open && setUserToGrant(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认授予写权限？</DialogTitle>
            <DialogDescription>
              确定要授予用户 "{userToGrant && displayName(userToGrant)}"
              对此班级的写权限吗？授权后该用户可以编辑班级信息、管理成员和关联比赛。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setUserToGrant(null)}
              disabled={grantMutation.isPending}
            >
              取消
            </Button>
            <Button
              onClick={() => userToGrant && grantMutation.mutate(userToGrant.user_id)}
              disabled={grantMutation.isPending}
            >
              {grantMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认授权
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation dialog */}
      <Dialog
        open={!!permToRevoke}
        onOpenChange={(open) => {
          if (!open) {
            setPermToRevoke(null);
            setSelfRevokeConfirmed(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {permToRevoke?.username === currentUsername && selfRevokeConfirmed
                ? "再次确认移除自己的权限？"
                : "确认移除写权限？"}
            </DialogTitle>
            <DialogDescription>
              {permToRevoke?.username === currentUsername &&
              selfRevokeConfirmed ? (
                <>
                  你正在移除
                  <span className="font-semibold">自己</span>
                  的写权限。移除后你将无法再编辑此班级，此操作不可自行撤销。
                </>
              ) : (
                <>
                  确定要移除用户 "
                  {permToRevoke && displayName(permToRevoke)}"
                  对此班级的写权限吗？
                  {permToRevoke?.username === currentUsername &&
                    "（注意：这是你自己的权限）"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setPermToRevoke(null);
                setSelfRevokeConfirmed(false);
              }}
              disabled={revokeMutation.isPending}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRevoke}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  移除中...
                </>
              ) : permToRevoke?.username === currentUsername &&
                !selfRevokeConfirmed ? (
                "确认移除"
              ) : (
                "确认移除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
