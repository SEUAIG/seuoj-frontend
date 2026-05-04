import { api } from "../api/axios";
import { permissionEndpoints } from "@/services/endpoints";
import type {
  PermissionActionRequest,
  PermissionActionResponse,
} from "@/models/permission";

export type RevokePermissionRequest = PermissionActionRequest;
export type RevokePermissionResponse = PermissionActionResponse;

export const revokePermission = async (
  data: RevokePermissionRequest
): Promise<RevokePermissionResponse> => {
  const response = await api.delete(permissionEndpoints.revoke, { data });
  return response.data;
};
