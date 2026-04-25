import { api } from "../api/axios";
import { problemSetEndpoints } from "@/services/endpoints";
import type {
  CreateProblemSetRequest,
  CreateProblemSetResponse,
} from "@/models/problemSet";

export type { CreateProblemSetRequest, CreateProblemSetResponse };

export const createProblemSet = async (
  payload: CreateProblemSetRequest
): Promise<CreateProblemSetResponse> => {
  const res = await api.post<CreateProblemSetResponse>(
    problemSetEndpoints.create,
    payload
  );
  return res.data;
};
