import { api } from "../api/axios";
import { permissionEndpoints } from "@/services/endpoints";
import type {
  PermissionActionRequest,
  PermissionActionResponse,
} from "@/models/permission";

export interface GrantPermissionRequest extends PermissionActionRequest {}
export interface GrantPermissionResponse extends PermissionActionResponse {}

export const grantPermission = async (
  data: GrantPermissionRequest
): Promise<GrantPermissionResponse> => {
  const response = await api.post(permissionEndpoints.grant, data);
  return response.data;
};
