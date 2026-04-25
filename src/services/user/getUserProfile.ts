import { api } from "@/services/api/axios";
import { userEndpoints } from "@/services/endpoints";
import type { UserProfile } from "@/models/user";

export type { UserProfile };

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const response = await api.get<{ code: number; data: UserProfile }>(
    userEndpoints.profileById(userId)
  );
  return response.data.data;
};
