import type { ApiResponse } from "@/models/common";

export type CommonUserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export interface GetUserPageRequest {
  current?: number;
  size?: number;
  username?: string;
  email?: string;
  roles?: CommonUserRole[];
}

export interface UserPageRecord {
  user_id: number;
  username: string;
  nickname: string | null;
  email: string;
  roles: CommonUserRole[];
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
  id: number;
  username: string;
  nickname: string | null;
  role: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
}

export interface UserMeResponse {
  id: number;
  username: string;
  nickname: string | null;
  email: string;
}

export type UpdateProfileResponse = ApiResponse<UserMeResponse>;
