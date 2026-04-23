import { api } from "../api/axios";

export interface DeleteClassResponse {
  code: number;
  message: string;
}

export const deleteClass = async (
  classId: number
): Promise<DeleteClassResponse> => {
  const response = await api.delete(`/api/class/${classId}`);
  return response.data;
};
