import { api } from "../api/axios";

export interface PermissionItem {
  id: number;
  user_id: number;
  username: string;
  nickname: string | null;
  permission: string;
  created_at: string;
}

export interface ListPermissionsResponse {
  code: number;
  message: string;
  data: PermissionItem[];
}

export const listPermissions = async (
  resourceType: string,
  resourceId: number
): Promise<ListPermissionsResponse> => {
  const response = await api.get(`/api/permission/${resourceType}/${resourceId}`);
  return response.data;
};
