import { api } from "@/services/api/axios";

export interface CreateProblemRequest {
  pid: string;
  title: string;
  is_public: boolean;
  tags: number[];
  description: string;
  input: string;
  output: string;
  example: {
    in: string;
    ans?: string | null;
    description?: string | null;
  }[];
  hint: string;
}

export interface CreateProblemResponse {
  code: number;
  message: string;
  data: {
    pid: string;
  };
}

export const createProblem = async (data: CreateProblemRequest): Promise<CreateProblemResponse> => {
  const res = await api.post<CreateProblemResponse>("/api/problem", data);
  return res.data;
};
