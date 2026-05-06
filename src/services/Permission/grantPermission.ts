import { api } from "../api/axios";
import { permissionEndpoints } from "@/services/endpoints";
import type {
  PermissionActionRequest,
  PermissionActionResponse,
} from "@/models/permission";

export type GrantPermissionRequest = PermissionActionRequest;
export type GrantPermissionResponse = PermissionActionResponse;

export const grantPermission = async (
  data: GrantPermissionRequest
): Promise<GrantPermissionResponse> => {
  const response = await api.post(permissionEndpoints.grant, data);
  return response.data;
};
