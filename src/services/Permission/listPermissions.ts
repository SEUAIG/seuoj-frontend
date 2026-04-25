import { api } from "../api/axios";
import { permissionEndpoints } from "@/services/endpoints";
import type {
  ListPermissionsResponse,
  PermissionItem,
} from "@/models/permission";

export type { ListPermissionsResponse, PermissionItem };

export const listPermissions = async (
  resourceType: string,
  resourceId: number
): Promise<ListPermissionsResponse> => {
  const response = await api.get(permissionEndpoints.list(resourceType, resourceId));
  return response.data;
};
