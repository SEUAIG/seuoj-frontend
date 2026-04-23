import { api } from "../api/axios";

export interface RemoveMemberResponse {
  code: number;
  message: string;
}

export const removeMember = async (
  classId: number,
  userId: number
): Promise<RemoveMemberResponse> => {
  const response = await api.delete(
    `/api/class/${classId}/member/${userId}`
  );
  return response.data;
};
