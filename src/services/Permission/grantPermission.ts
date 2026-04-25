import { api } from "../api/axios";

export interface GrantPermissionRequest {
  resourceType: string;
  resourceId: string;
  targetUserId: string;
  permission: string;
}

export interface GrantPermissionResponse {
  code: number;
  message: string;
}

export const grantPermission = async (
  data: GrantPermissionRequest
): Promise<GrantPermissionResponse> => {
  const response = await api.post("/api/permission/grant", data);
  return response.data;
};
