import { api } from "../api/axios";

export type CreateProblemSetRequest = {
  title: string;
  discription?: string;
  is_public?: string;
};

export type CreateProblemSetResponse = {
  code: number;
  message: string;
};

export const createProblemSet = async (
  payload: CreateProblemSetRequest
): Promise<CreateProblemSetResponse> => {
  const res = await api.post<CreateProblemSetResponse>(
    "/api/problem_set",
    payload
  );
  return res.data;
};
