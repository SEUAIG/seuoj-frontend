import { api } from "../api/axios";

export interface ClassItem {
  class_id: number;
  name: string;
  description: string;
  is_public: boolean;
}

export interface ClassPageResponse {
  code: number;
  message: string;
  data: {
    current: number;
    size: number;
    total: number;
    records: ClassItem[];
  };
}

export interface GetClassPageRequest {
  current?: number;
  size?: number;
}

export const getClassPage = async (
  params: GetClassPageRequest
): Promise<ClassPageResponse> => {
  const response = await api.get("/api/class/page", {
    params,
  });
  return response.data;
};
