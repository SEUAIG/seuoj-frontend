import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <Select
      value={currentRole}
      onValueChange={(v) => onRoleChange(v as CommonUserRole)}
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
  );
}
