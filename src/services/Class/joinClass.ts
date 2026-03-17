import { api } from "../api/axios";

export interface JoinClassResponse {
  code: number;
  message: string;
}

export const joinClass = async (
  class_public_id: string
): Promise<JoinClassResponse> => {
  const response = await api.post(`/api/class/${class_public_id}/join`);
  return response.data;
};
