import { api } from "../api/axios";

export interface AddMemberResponse {
  code: number;
  message: string;
}

export const addMember = async (
  classId: number,
  userId: number
): Promise<AddMemberResponse> => {
  const response = await api.post(
    `/api/class/${classId}/member/${userId}`
  );
  return response.data;
};
