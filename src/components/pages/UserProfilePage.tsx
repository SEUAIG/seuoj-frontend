import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getUserProfile, UserProfile } from "@/services/user/getUserProfile";
import { updateUserRole } from "@/services/user/updateUserRole";
import { getAssignableRoles, canEditUserRole, roleToUpper, roleToLower } from "@/lib/rolePermissions";
import RoleSelect from "@/components/bussiness/RoleSelect";
import type { CommonUserRole } from "@/models/user";

const roleLabelMap: Record<string, string> = {
  student: "学生",
  teacher: "教师",
  admin: "管理员",
  superadmin: "超级管理员",
};

const roleVariantMap: Record<string, "default" | "secondary" | "destructive"> = {
  student: "secondary",
  teacher: "default",
  admin: "destructive",
  superadmin: "destructive",
};

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState(false);

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

  return (
    <>
      <Helmet>
        <title>{displayName} - 用户资料</title>
      </Helmet>
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardContent className="flex items-center gap-6 p-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{displayName}</span>
                {(() => {
                  const upperRole = roleToUpper(profile.role);
                  const editable = canEditUserRole(
                    currentUser?.role,
                    currentUser?.username ?? "",
                    profile.username,
                    upperRole
                  );
                  if (editable) {
                    return (
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
                    );
                  }
                  return (
                    <Badge variant={roleVariantMap[profile.role] || "secondary"}>
                      {roleLabelMap[profile.role] || profile.role}
                    </Badge>
                  );
                })()}
              </div>
              {profile.nickname && (
                <span className="text-muted-foreground">@{profile.username}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
