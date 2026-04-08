import { api } from "../api/axios";

export interface AddMemberResponse {
  code: number;
  message: string;
}

export const addMember = async (
  class_public_id: string,
  user_public_id: string
): Promise<AddMemberResponse> => {
  const response = await api.post(
    `/api/class/${class_public_id}/member/${user_public_id}`
  );
  return response.data;
};
