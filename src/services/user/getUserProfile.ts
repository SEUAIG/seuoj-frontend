import { api } from "@/services/api/axios";

export interface UserProfile {
  id: number;
  username: string;
  nickname: string | null;
  role: string;
}

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const response = await api.get<{ code: number; data: UserProfile }>(
    `/api/user/profile/${userId}`
  );
  return response.data.data;
};
