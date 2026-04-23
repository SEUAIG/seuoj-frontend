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
  classId: number,
  data: UpdateClassRequest
): Promise<UpdateClassResponse> => {
  const response = await api.put(`/api/class/${classId}`, data);
  return response.data;
};
