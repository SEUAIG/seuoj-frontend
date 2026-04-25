import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
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
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getUserProfile, UserProfile } from "@/services/user/getUserProfile";
import { adminUpdateProfile } from "@/services/user/adminUpdateProfile";
import { updateUserRole } from "@/services/user/updateUserRole";
import {
  getAssignableRoles,
  canEditUserRole,
  roleToUpper,
  roleToLower,
} from "@/lib/rolePermissions";
import RoleSelect from "@/components/bussiness/RoleSelect";
import type { CommonUserRole } from "@/models/user";
import nahida from "@/assets/nahida.png";
import seu from "@/assets/seu.png";

const roleLabelMap: Record<string, string> = {
  student: "学生",
  teacher: "教师",
  admin: "管理员",
  superadmin: "超级管理员",
};

const roleVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  student: "outline",
  teacher: "secondary",
  admin: "default",
  superadmin: "destructive",
};

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleUpdating, setRoleUpdating] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("practice");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getUserProfile(Number(userId))
      .then(setProfile)
      .catch((err) => {
        setError(err?.response?.data?.message || "获取用户资料失败");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center text-muted-foreground">
        {error || "用户不存在"}
      </div>
    );
  }

  const displayName = profile.nickname || profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const upperRole = roleToUpper(profile.role);
  const editable = canEditUserRole(
    currentUser?.role,
    currentUser?.username ?? "",
    profile.username,
    upperRole
  );

  const openEditProfile = () => {
    setEditNickname(profile.nickname || "");
    setEditProfileOpen(true);
  };

  const handleUpdateProfile = async () => {
    setEditProfileLoading(true);
    try {
      const res = await adminUpdateProfile(profile.id, {
        nickname: editNickname,
      });
      if (res.code === 0) {
        toast.success("资料更新成功");
        setProfile((prev) =>
          prev
            ? { ...prev, nickname: editNickname.trim() || null }
            : prev
        );
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

  return (
    <>
      <Helmet>
        <title>{displayName} - 用户资料</title>
      </Helmet>
      <div className="w-4/5 mx-auto py-6">
        <section className="relative overflow-hidden rounded-2xl border">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${seu})` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="relative z-10 px-8 py-10 text-white">
            <div className="text-2xl font-semibold">{displayName} 的主页</div>
            <div className="text-sm text-white/70 mt-2">@{profile.username}</div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={nahida} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{displayName}</span>
                      {editable ? (
                        <RoleSelect
                          currentRole={upperRole as CommonUserRole}
                          assignableRoles={getAssignableRoles(currentUser?.role)}
                          loading={roleUpdating}
                          onRoleChange={async (newRole) => {
                            setRoleUpdating(true);
                            try {
                              const res = await updateUserRole(profile.id, newRole);
                              if (res.code === 0) {
                                toast.success(`角色已更改为 ${newRole}`);
                                setProfile((prev) =>
                                  prev ? { ...prev, role: roleToLower(newRole) } : prev
                                );
                              } else {
                                toast.error(res.message || "角色修改失败");
                              }
                            } catch (err: unknown) {
                              toast.error(
                                "角色修改失败: " +
                                  (err instanceof Error ? err.message : String(err))
                              );
                            } finally {
                              setRoleUpdating(false);
                            }
                          }}
                        />
                      ) : (
                        <Badge variant={roleVariantMap[profile.role] || "secondary"}>
                          {roleLabelMap[profile.role] || profile.role}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{profile.username}
                    </div>
                  </div>
                </div>
                {editable && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={openEditProfile}>
                      <Pencil className="h-4 w-4 mr-1" />
                      编辑资料
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                {[
                  { label: "解题数", value: "-" },
                  { label: "竞赛分", value: "-" },
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
                <div className="text-sm text-muted-foreground">暂无简介</div>
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-4">
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

        {/* Admin Edit Profile Dialog */}
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>编辑资料</DialogTitle>
              <DialogDescription>
                修改 @{profile.username} 的昵称。
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
