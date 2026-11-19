import type { ApiResponse } from "@/models/common";

export type CommonUserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export interface GetUserPageRequest {
  current?: number;
  size?: number;
  username?: string;
  email?: string;
  roles?: CommonUserRole[];
  /** true 只看封禁中，false 只看未封禁 */
  banned?: boolean;
}

export interface UserPageRecord {
  /** 能否编辑资料、重设密码、改权限（只有超级管理员） */
  canManageProfile: boolean;
  /** 能否封禁／解封 */
  canBan: boolean;
  user_id: number;
  username: string;
  nickname: string | null;
  email: string;
  roles: CommonUserRole[];
  /** 仅用户管理者能看到封禁详情 */
  banned?: boolean;
  banReason?: string | null;
  /** 空表示永久 */
  bannedUntil?: string | null;
  bannedAt?: string | null;
}

export interface UserPageData {
  current: number;
  size: number;
  total: number;
  records: UserPageRecord[];
}

export type GetUserPageResponse = ApiResponse<UserPageData>;

export interface BatchImportUserRow {
  username: string;
  nickname?: string;
  email: string;
  password?: string;
}

export interface BatchImportRequest {
  passwordMode: "assigned" | "random";
  sendEmail: boolean;
  users: BatchImportUserRow[];
}

export interface SuccessDetail {
  row: number;
  username: string;
  email: string;
  password: string;
}

export interface SkipDetail {
  row: number;
  username: string;
  email: string;
  reason: string;
}

export interface FailDetail {
  row: number;
  username: string;
  email: string;
  reason: string;
}

export interface BatchImportResult {
  totalCount: number;
  successCount: number;
  skippedCount: number;
  failCount: number;
  successes: SuccessDetail[];
  skipped: SkipDetail[];
  failures: FailDetail[];
}

export type BatchImportResponse = ApiResponse<BatchImportResult>;

export interface UserProfile {
  canManageProfile: boolean;
  id: number;
  username: string;
  nickname: string | null;
  role: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
}

export interface UserMeResponse {
  role: import("@/features/auth/types").UserRole;
  capabilities: import("@/lib/capabilities").Capability[];
  allowNicknameChange: boolean;
  id: number;
  username: string;
  nickname: string | null;
  email: string;
}

export type UpdateProfileResponse = ApiResponse<UserMeResponse>;
