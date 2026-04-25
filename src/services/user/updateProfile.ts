import { api } from "@/services/api/axios";
import { userEndpoints } from "@/services/endpoints";
import type {
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserMeResponse,
} from "@/models/user";

export type { UpdateProfileRequest, UpdateProfileResponse, UserMeResponse };

export const updateProfile = async (
  req: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await api.put<UpdateProfileResponse>(userEndpoints.meProfile, req);
  return response.data;
};
