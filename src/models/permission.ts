import type { ApiResponse, ApiResponseBase } from "@/models/common";

export interface PermissionItem {
  id: number;
  user_id: number;
  username: string;
  nickname: string | null;
  permission: string;
  created_at: string;
}

export interface PermissionActionRequest {
  resourceType: string;
  resourceId: string;
  targetUserId: string;
  permission: string;
}

export type ListPermissionsResponse = ApiResponse<PermissionItem[]>;
export type PermissionActionResponse = ApiResponseBase;
