import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { CommonUserRole } from "@/models/user";

const roleLabels: Record<CommonUserRole, string> = {
  STUDENT: "学生",
  TEACHER: "教师",
  ADMIN: "管理员",
  SUPER_ADMIN: "超级管理员",
};

interface RoleSelectProps {
  currentRole: CommonUserRole;
  assignableRoles: CommonUserRole[];
  disabled?: boolean;
  loading?: boolean;
  onRoleChange: (newRole: CommonUserRole) => void;
}

export default function RoleSelect({
  currentRole,
  assignableRoles,
  disabled,
  loading,
  onRoleChange,
}: RoleSelectProps) {
  const [pendingRole, setPendingRole] = useState<CommonUserRole | null>(null);

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <>
      <Select
        value={currentRole}
        onValueChange={(v) => {
          const newRole = v as CommonUserRole;
          if (newRole !== currentRole) {
            setPendingRole(newRole);
          }
        }}
        disabled={disabled || assignableRoles.length === 0}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {assignableRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {roleLabels[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={pendingRole !== null} onOpenChange={(open) => { if (!open) setPendingRole(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认修改角色</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将角色从「{roleLabels[currentRole]}」修改为「{pendingRole ? roleLabels[pendingRole] : ""}」吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRole) {
                  onRoleChange(pendingRole);
                  setPendingRole(null);
                }
              }}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
