import type { UserRole } from "@/features/auth/types";
import type { CommonUserRole } from "@/models/user";

export function getAssignableRoles(currentUserRole: UserRole | undefined): CommonUserRole[] {
  if (currentUserRole === "superadmin") return ["STUDENT", "TEACHER", "ADMIN"];
  if (currentUserRole === "admin") return ["STUDENT", "TEACHER"];
  return [];
}

export function canEditUserRole(
  currentUserRole: UserRole | undefined,
  currentUsername: string,
  targetUsername: string,
  targetRoleUpper: string
): boolean {
  if (!currentUserRole || (currentUserRole !== "admin" && currentUserRole !== "superadmin"))
    return false;
  if (currentUsername === targetUsername) return false;
  if (targetRoleUpper === "SUPER_ADMIN") return false;
  if (currentUserRole === "admin" && targetRoleUpper === "ADMIN") return false;
  return true;
}

const roleToUpperMap: Record<string, string> = {
  student: "STUDENT",
  teacher: "TEACHER",
  admin: "ADMIN",
  superadmin: "SUPER_ADMIN",
};

const roleToLowerMap: Record<string, string> = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
};

export function roleToUpper(role: string): string {
  return roleToUpperMap[role] || role.toUpperCase();
}

export function roleToLower(role: string): string {
  return roleToLowerMap[role] || role.toLowerCase().replace("_", "");
}
