import { api } from "../api/axios";

export interface UpdateClassRequest {
  name: string;
  description: string;
  is_public: boolean;
}

export interface UpdateClassResponse {
  code: number;
  message: string;
}

export const updateClass = async (
  class_public_id: string,
  data: UpdateClassRequest
): Promise<UpdateClassResponse> => {
  const response = await api.put(`/api/class/${class_public_id}`, data);
  return response.data;
};
