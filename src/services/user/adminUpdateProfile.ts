import { api } from "@/services/api/axios";
import { userEndpoints } from "@/services/endpoints";
import type { ApiResponseBase } from "@/models/common";

export const adminUpdateProfile = async (
  userId: number,
  data: { nickname?: string }
): Promise<ApiResponseBase> => {
  const response = await api.put<ApiResponseBase>(
    userEndpoints.adminUpdateProfile(userId),
    data
  );
  return response.data;
};
