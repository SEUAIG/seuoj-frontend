import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Loader2, KeyRound, Pencil } from "lucide-react";
import { api } from "@/services/api/axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { toast } from "sonner";
import { setNickname as setNicknameAction } from "@/features/auth/authSlice";
import { updateProfile } from "@/services/user/updateProfile";
import AnswerState from "@/components/common/AnswerState";
import ProblemListPageChoose from "@/components/bussiness/ProblemListPageChoose";
import { setCurrent as setSubmissionCurrent } from "@/features/SubmissionList/submissionListSlice";
import nahida from "@/assets/nahida.png";
import seu from "@/assets/seu.png";
import useQueryToGetSubmission from "@/hooks/useQueryToGetSubmission";
import useQueryToGetUserPage from "@/hooks/useQueryToGetUserPage";
import SubmissionHeatmap from "@/components/profile/SubmissionHeatmap";

export default function PersonalPage() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { current, size } = useSelector(
    (state: RootState) => state.submissionList
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
      const res = await api.post("/api/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      if (res.data.code === 0) {
        toast.success("密码修改成功");
        setChangePwdOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.data.message || "修改失败");
      }
    } catch (err: unknown) {
      toast.error(
        "修改失败: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setChangePwdLoading(false);
    }
  };
  const isSubmissionActive = activeTab === "submissions";
  const { data, isLoading, isFetching, isError, error, refetch } =
    useQueryToGetSubmission(current, size, isSubmissionActive);
  const records = data?.records || [];
  const total = data?.total || 0;
  const loadError = isError
    ? error instanceof Error
      ? error.message
      : "加载提交记录失败"
    : null;
  const pages = useMemo(() => {
    if (!total) return 0;
    return Math.ceil(total / Number(size));
  }, [total, size]);
  const canViewUserPage = isAuthenticated && user?.role !== "guest" && user?.role !== "student";
  const [userPageCurrent, setUserPageCurrent] = useState(1);
  const userPageSize = 10;
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [userFilters, setUserFilters] = useState<{
    username?: string;
    email?: string;
  }>({});
  const isUserTabActive = activeTab === "users";
  const {
    data: userPageData,
    isLoading: isUserPageLoading,
    isFetching: isUserPageFetching,
    isError: isUserPageError,
    error: userPageError,
    refetch: refetchUserPage,
  } = useQueryToGetUserPage(
    {
      current: userPageCurrent,
      size: userPageSize,
      username: userFilters.username,
      email: userFilters.email,
    },
    canViewUserPage && isUserTabActive
  );
  const userRecords = userPageData?.records || [];
  const userTotal = userPageData?.total || 0;
  const userPages = useMemo(() => {
    if (!userTotal) return 0;
    return Math.ceil(userTotal / userPageSize);
  }, [userTotal]);
  const userLoadError = isUserPageError
    ? userPageError instanceof Error
      ? userPageError.message
      : "加载用户列表失败"
    : null;
  useEffect(() => {
    if (isError && loadError) {
      toast.error(loadError, { position: "top-center" });
    }
  }, [isError, loadError]);
  useEffect(() => {
    if (isUserPageError && userLoadError) {
      toast.error(userLoadError, { position: "top-center" });
    }
  }, [isUserPageError, userLoadError]);
  return (
    <>
      <Helmet>
        <title>个人主页 - SeuOJ</title>
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
                    <AvatarImage src={nahida} />
                    <AvatarFallback>{(user?.nickname || user?.username || "U")[0].toUpperCase()}</AvatarFallback>
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
                  <TabsTrigger value="submissions">提交记录</TabsTrigger>
                  {canViewUserPage && <TabsTrigger value="users">用户列表</TabsTrigger>}
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
              <TabsContent value="submissions">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        共计{" "}
                        <span className="font-semibold text-foreground">
                          {total}
                        </span>{" "}
                        条记录
                      </div>
                      <div className="flex items-center gap-3">
                        {isFetching && records.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            更新中...
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => refetch()}
                        >
                          刷新
                        </Button>
                      </div>
                    </div>
                    {isLoading && records.length === 0 && (
                      <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        加载提交记录中...
                      </div>
                    )}
                    {loadError && records.length === 0 && (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                        {loadError}
                        <Button size="sm" onClick={() => refetch()}>
                          重试
                        </Button>
                      </div>
                    )}
                    {loadError && records.length > 0 && (
                      <div className="rounded-lg border border-dashed px-4 py-2 text-xs text-muted-foreground">
                        {loadError}
                      </div>
                    )}
                    {!isLoading && !loadError && records.length === 0 && (
                      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                        暂无提交记录
                      </div>
                    )}
                    {records.length > 0 && (
                      <div className={isFetching ? "opacity-70" : ""}>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">
                                提交号
                              </TableHead>
                              <TableHead className="text-center">
                                题目
                              </TableHead>
                              <TableHead className="text-center">
                                状态
                              </TableHead>
                              <TableHead className="text-center">
                                语言
                              </TableHead>
                              <TableHead className="text-center">
                                提交者
                              </TableHead>
                              <TableHead className="text-center">
                                提交时间
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map((record) => (
                              <TableRow key={record.submission_no}>
                                <TableCell className="text-center font-mono">
                                  <span title={record.submission_no}>
                                    {record.submission_no.slice(0, 8)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.pid}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.verdict ? (
                                    <AnswerState state={record.verdict} />
                                  ) : (
                                    <span className="text-muted-foreground">
                                      {record.status}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.language}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.nickname || record.username}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.submit_time}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {!!pages && (
                      <ProblemListPageChoose
                        pages={pages}
                        current={current}
                        dispatch={dispatch}
                        refetch={() => refetch()}
                        setCurrentAction={setSubmissionCurrent}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              {canViewUserPage && (
                <TabsContent value="users">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-col gap-3 md:flex-row">
                        <Input
                          placeholder="按用户名搜索"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                        />
                        <Input
                          placeholder="按邮箱搜索"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <Button
                          onClick={() => {
                            setUserPageCurrent(1);
                            setUserFilters({
                              username: usernameInput.trim() || undefined,
                              email: emailInput.trim() || undefined,
                            });
                          }}
                        >
                          查询
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUsernameInput("");
                            setEmailInput("");
                            setUserPageCurrent(1);
                            setUserFilters({});
                          }}
                        >
                          重置
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          共计{" "}
                          <span className="font-semibold text-foreground">
                            {userTotal}
                          </span>{" "}
                          位用户
                        </div>
                        <div className="flex items-center gap-3">
                          {isUserPageFetching && userRecords.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              更新中...
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refetchUserPage()}
                          >
                            刷新
                          </Button>
                        </div>
                      </div>
                      {isUserPageLoading && userRecords.length === 0 && (
                        <div className="flex items-center justify-center py-10 text-muted-foreground">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          加载用户列表中...
                        </div>
                      )}
                      {userLoadError && userRecords.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                          {userLoadError}
                          <Button size="sm" onClick={() => refetchUserPage()}>
                            重试
                          </Button>
                        </div>
                      )}
                      {userLoadError && userRecords.length > 0 && (
                        <div className="rounded-lg border border-dashed px-4 py-2 text-xs text-muted-foreground">
                          {userLoadError}
                        </div>
                      )}
                      {!isUserPageLoading &&
                        !userLoadError &&
                        userRecords.length === 0 && (
                          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            暂无用户数据
                          </div>
                        )}
                      {userRecords.length > 0 && (
                        <div className={isUserPageFetching ? "opacity-70" : ""}>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-center">
                                  用户ID
                                </TableHead>
                                <TableHead className="text-center">
                                  用户名
                                </TableHead>
                                <TableHead className="text-center">
                                  昵称
                                </TableHead>
                                <TableHead className="text-center">
                                  邮箱
                                </TableHead>
                                <TableHead className="text-center">
                                  角色
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userRecords.map((record) => (
                                <TableRow key={record.user_id}>
                                  <TableCell className="text-center font-mono">
                                    {record.user_id}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {record.username}
                                  </TableCell>
                                  <TableCell className="text-center text-muted-foreground">
                                    {record.nickname || "-"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {record.email}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex justify-center gap-1 flex-wrap">
                                      {record.roles.map((role) => (
                                        <Badge key={role} variant="outline">
                                          {role}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      {!!userPages && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={userPageCurrent <= 1}
                            onClick={() =>
                              setUserPageCurrent((prev) => Math.max(1, prev - 1))
                            }
                          >
                            上一页
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            第 {userPageCurrent} / {userPages} 页
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={userPageCurrent >= userPages}
                            onClick={() =>
                              setUserPageCurrent((prev) =>
                                Math.min(userPages, prev + 1)
                              )
                            }
                          >
                            下一页
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
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
      </div>
    </>
  );
}
