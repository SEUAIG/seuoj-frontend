import { api } from "../api/axios";

export interface JoinClassResponse {
  code: number;
  message: string;
}

export const joinClass = async (
  classId: number
): Promise<JoinClassResponse> => {
  const response = await api.post(`/api/class/${classId}/join`);
  return response.data;
};
