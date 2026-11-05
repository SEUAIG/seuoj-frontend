import type { User } from "@/features/auth/types";

export const capabilityLabels = {
  PROBLEM_CREATE: "题目创建与导入", PROBLEM_MANAGE: "题目管理",
  CONTEST_CREATE: "比赛创建", CONTEST_MANAGE: "比赛管理", USER_MANAGE: "用户管理",
  TEACHER: "教师权限", ACCOUNT_ADMIN: "账号管理员",
} as const;
export type Capability = keyof typeof capabilityLabels;
export const baseCapabilities: Capability[] = ["PROBLEM_CREATE", "PROBLEM_MANAGE", "CONTEST_CREATE", "CONTEST_MANAGE", "USER_MANAGE"];
export function effectiveCapabilities(assigned: Capability[]): Capability[] {
  const result = new Set(assigned);
  if (result.has("ACCOUNT_ADMIN")) return Object.keys(capabilityLabels) as Capability[];
  if (result.has("TEACHER")) { result.add("PROBLEM_CREATE"); result.add("CONTEST_CREATE"); }
  return [...result];
}
export function hasCapability(user: User | null | undefined, capability: Capability): boolean {
  // Old persisted sessions are refreshed from /user/me; their role remains a safe UI fallback.
  if (user?.capabilities) return user.capabilities.includes(capability);
  return effectiveCapabilities(user?.role === "superadmin" || user?.role === "admin" ? ["ACCOUNT_ADMIN"] : user?.role === "teacher" ? ["TEACHER"] : []).includes(capability);
}
