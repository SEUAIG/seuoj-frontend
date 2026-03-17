import { api } from "../api/axios";

export interface DeleteClassResponse {
  code: number;
  message: string;
}

export const deleteClass = async (
  class_public_id: string
): Promise<DeleteClassResponse> => {
  const response = await api.delete(`/api/class/${class_public_id}`);
  return response.data;
};
