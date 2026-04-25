import { api } from "@/services/api/axios";
import { userEndpoints } from "@/services/endpoints";
import type { ApiResponseBase } from "@/models/common";
import type { CommonUserRole } from "@/models/user";

export const updateUserRole = async (
  userId: number,
  role: CommonUserRole
): Promise<ApiResponseBase> => {
  const response = await api.put<ApiResponseBase>(
    userEndpoints.adminUpdateRole(userId),
    { role }
  );
  return response.data;
};
