import { api } from "../api/axios";

export interface RevokePermissionRequest {
  resourceType: string;
  resourceId: string;
  targetUserId: string;
  permission: string;
}

export interface RevokePermissionResponse {
  code: number;
  message: string;
}

export const revokePermission = async (
  data: RevokePermissionRequest
): Promise<RevokePermissionResponse> => {
  const response = await api.delete("/api/permission/revoke", { data });
  return response.data;
};
