import { api } from "../api/axios";

export interface CreateClassRequest {
  name: string;
  description?: string;
  is_public: boolean;
}

export interface CreateClassResponse {
  code: number;
  message: string;
  data: {
    class_public_id: string;
  };
}

export const createClass = async (
  data: CreateClassRequest
): Promise<CreateClassResponse> => {
  const response = await api.post("/api/class", data);
  return response.data;
};
