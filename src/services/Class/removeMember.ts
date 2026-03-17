import { api } from "../api/axios";

export interface RemoveMemberResponse {
  code: number;
  message: string;
}

export const removeMember = async (
  class_public_id: string,
  user_public_id: string
): Promise<RemoveMemberResponse> => {
  const response = await api.delete(
    `/api/class/${class_public_id}/member/${user_public_id}`
  );
  return response.data;
};
