import { api } from "../api/axios";
import { problemSetEndpoints } from "@/services/endpoints";
import type {
  ProblemSetProblemEditItem,
  UpdateProblemSetProblemListRequest,
  UpdateProblemSetProblemListResponse,
} from "@/models/problemSet";

export type {
  ProblemSetProblemEditItem,
  UpdateProblemSetProblemListRequest,
  UpdateProblemSetProblemListResponse,
};

export const updateProblemSetProblemList = async (
  problem_set_id: string,
  payload: UpdateProblemSetProblemListRequest
): Promise<UpdateProblemSetProblemListResponse> => {
  const res = await api.post<UpdateProblemSetProblemListResponse>(
    problemSetEndpoints.updateProblemList(problem_set_id),
    payload
  );
  return res.data;
};
