import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound, Pencil, Bot, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { toast } from "sonner";
import { setNickname as setNicknameAction } from "@/features/auth/authSlice";
import { updateProfile } from "@/services/user/updateProfile";
import { changePassword } from "@/services/auth";
import { api } from "@/services/api/axios";
import seu from "@/assets/seu.png";
import SubmissionHeatmap from "@/components/profile/SubmissionHeatmap";

export default function PersonalPage() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [activeTab, setActiveTab] = useState("practice");
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePwdLoading, setChangePwdLoading] = useState(false);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editProfileLoading, setEditProfileLoading] = useState(false);

  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyResult, setClassifyResult] = useState<{
    total: number;
    classified: number;
    failed: number;
    details: Array<{
      pid: string;
      title: string;
      status: string;
      reason?: string;
      tagIds?: number[];
      newTags?: string[];
    }>;
    suggestedNewTags: string[];
  } | null>(null);
  const [classifyResultOpen, setClassifyResultOpen] = useState(false);
  const [createTagsLoading, setCreateTagsLoading] = useState(false);
  const [selectedNewTags, setSelectedNewTags] = useState<Set<string>>(new Set());

  const isSuperAdmin = user?.role === "superadmin";

  const handleClassifyTags = async () => {
    setClassifyLoading(true);
    setClassifyResult(null);
    setSelectedNewTags(new Set());
    try {
      const res = await api.post("/api/admin/problem/classify-tags");
      if (res.data.code === 0) {
        const data = res.data.data;
        setClassifyResult(data);
        setClassifyResultOpen(true);
        // 默认全选建议的新标签
        if (data.suggestedNewTags?.length > 0) {
          setSelectedNewTags(new Set(data.suggestedNewTags));
        }
        toast.success(
          `分类完成：共 ${data.total} 题，成功 ${data.classified} 题`
        );
      } else {
        toast.error(res.data.message || "分类失败");
      }
    } catch (err: unknown) {
      toast.error(
        "分类失败: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setClassifyLoading(false);
    }
  };

  const handleCreateNewTags = async () => {
    const tagsToCreate = Array.from(selectedNewTags);
    if (tagsToCreate.length === 0) {
      toast.error("请至少选择一个新标签");
      return;
    }
    setCreateTagsLoading(true);
    try {
      const res = await api.post("/api/admin/problem/create-tags", {
        tag_names: tagsToCreate,
      });
      if (res.data.code === 0) {
        const { created, skipped } = res.data.data;
        toast.success(`新标签创建完成：成功 ${created} 个，跳过 ${skipped} 个`);
        // 从建议列表中移除已创建的
        setClassifyResult((prev) =>
          prev
            ? {
                ...prev,
                suggestedNewTags: prev.suggestedNewTags.filter(
                  (t) => !selectedNewTags.has(t)
                ),
              }
            : prev
        );
        setSelectedNewTags(new Set());
      } else {
        toast.error(res.data.message || "创建失败");
      }
    } catch (err: unknown) {
      toast.error(
        "创建失败: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setCreateTagsLoading(false);
    }
  };

  const openEditProfile = () => {
    setEditNickname(user?.nickname || "");
    setEditProfileOpen(true);
  };

  const handleUpdateProfile = async () => {
    setEditProfileLoading(true);
    try {
      const res = await updateProfile({ nickname: editNickname });
      if (res.code === 0) {
        toast.success("资料更新成功");
        dispatch(setNicknameAction(res.data.nickname || undefined));
        setEditProfileOpen(false);
      } else {
        toast.error(res.message || "更新失败");
      }
    } catch (err: unknown) {
      toast.error(
        "更新失败: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("请填写所有字段");
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      toast.error("新密码长度需在 6-20 位之间");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }
    setChangePwdLoading(true);
    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      if (res.code === 0) {
        toast.success("密码修改成功");
        setChangePwdOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "修改失败");
      }
    } catch (err: unknown) {
      toast.error(
        "修改失败: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setChangePwdLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>个人主页 - SEUOJ</title>
      </Helmet>
      <div className="w-4/5 mx-auto py-6">
        <section className="relative overflow-hidden rounded-2xl border">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${seu})` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="relative z-10 px-8 py-10 text-white">
            <div className="text-2xl font-semibold">个人主页</div>
            <div className="text-sm text-white/70 mt-2">1</div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {(user?.nickname || user?.username || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{user?.nickname || user?.username || "用户"}</span>
                      {user?.role && (
                        <Badge variant={
                          user.role === "superadmin" ? "destructive" :
                          user.role === "admin" ? "default" :
                          user.role === "teacher" ? "secondary" : "outline"
                        }>
                          {({ superadmin: "超级管理员", admin: "管理员", teacher: "教师", student: "学生" } as Record<string, string>)[user.role] || user.role}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{user?.username}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={openEditProfile}>
                    <Pencil className="h-4 w-4 mr-1" />
                    编辑资料
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChangePwdOpen(true)}
                  >
                    <KeyRound className="h-4 w-4 mr-1" />
                    修改密码
                  </Button>
                  {isSuperAdmin && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleClassifyTags}
                      disabled={classifyLoading}
                    >
                      {classifyLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Bot className="h-4 w-4 mr-1" />
                      )}
                      {classifyLoading ? "分类中..." : "智能标签分类"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                {[
                  { label: "解题数", value: "1024" },
                  { label: "竞赛分", value: "1211" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <div className="text-sm font-medium">个人简介</div>
                <div className="text-sm text-muted-foreground">用户权限</div>
              </CardContent>
            </Card>
          </aside>
          <section className="space-y-4">
            <SubmissionHeatmap year={new Date().getFullYear()} />
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <div className="sticky top-4 z-10 rounded-xl border bg-background/90 px-4 py-2 backdrop-blur">
                <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
                  <TabsTrigger value="practice">题单</TabsTrigger>
                  <TabsTrigger value="stats">解题数据</TabsTrigger>
                  <TabsTrigger value="discussion">讨论</TabsTrigger>
                  <TabsTrigger value="achievement">成就</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="practice">
                <div className="grid gap-4 md:grid-cols-2">
                  {["题单列表", "最近更新", "HOT 标签"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="stats">
                <div className="grid gap-4 md:grid-cols-2">
                  {["解题总览", "难度分布", "排名趋势"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="discussion">
                <div className="grid gap-4 md:grid-cols-2">
                  {["最近发帖", "最近回复"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="achievement">
                <div className="grid gap-4 md:grid-cols-2">
                  {["徽章墙", "里程碑记录"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={changePwdOpen} onOpenChange={setChangePwdOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>修改密码</DialogTitle>
              <DialogDescription>
                输入旧密码验证身份后设置新密码。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">旧密码</label>
                <Input
                  type="password"
                  placeholder="请输入当前密码"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">新密码</label>
                <Input
                  type="password"
                  placeholder="6-20 位新密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">确认新密码</label>
                <Input
                  type="password"
                  placeholder="再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setChangePwdOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={changePwdLoading}
              >
                {changePwdLoading ? "提交中..." : "确认修改"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>编辑资料</DialogTitle>
              <DialogDescription>
                修改昵称后将在全站展示。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">昵称</label>
                <Input
                  placeholder="输入昵称（留空则显示用户名）"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  maxLength={64}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateProfile()}
                />
                <p className="text-xs text-muted-foreground">
                  当前用户名: @{user?.username}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditProfileOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleUpdateProfile}
                disabled={editProfileLoading}
              >
                {editProfileLoading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Classify Result Dialog */}
        <Dialog open={classifyResultOpen} onOpenChange={setClassifyResultOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>标签分类结果</DialogTitle>
              <DialogDescription>
                共 {classifyResult?.total ?? 0} 道无标签题目，
                成功分类 {classifyResult?.classified ?? 0} 道，
                失败 {classifyResult?.failed ?? 0} 道。
              </DialogDescription>
            </DialogHeader>
            {classifyResult?.details && classifyResult.details.length > 0 && (
              <div className="space-y-2 py-2">
                {classifyResult.details.map((item) => (
                  <div
                    key={item.pid}
                    className="flex items-start justify-between gap-2 rounded-md border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {item.pid} - {item.title}
                      </div>
                      {item.reason && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.reason}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={
                        item.status === "success"
                          ? "default"
                          : item.status === "skipped"
                          ? "secondary"
                          : "destructive"
                      }
                      className="shrink-0"
                    >
                      {item.status === "success"
                        ? "成功"
                        : item.status === "skipped"
                        ? "跳过"
                        : "失败"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {classifyResult?.suggestedNewTags &&
              classifyResult.suggestedNewTags.length > 0 && (
                <div className="border-t pt-3 mt-2">
                  <div className="text-sm font-medium mb-2">
                    LLM 建议新增以下标签（请确认是否创建）：
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classifyResult.suggestedNewTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm cursor-pointer hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={selectedNewTags.has(tag)}
                          onChange={(e) => {
                            const next = new Set(selectedNewTags);
                            if (e.target.checked) {
                              next.add(tag);
                            } else {
                              next.delete(tag);
                            }
                            setSelectedNewTags(next);
                          }}
                          className="accent-primary"
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            <DialogFooter>
              {classifyResult?.suggestedNewTags &&
                classifyResult.suggestedNewTags.length > 0 && (
                  <Button
                    variant="default"
                    onClick={handleCreateNewTags}
                    disabled={
                      createTagsLoading || selectedNewTags.size === 0
                    }
                  >
                    {createTagsLoading
                      ? "创建中..."
                      : `确认创建选中标签 (${selectedNewTags.size})`}
                  </Button>
                )}
              <Button
                variant="outline"
                onClick={() => setClassifyResultOpen(false)}
              >
                关闭
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
