import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestProblemEditItem,
  UpdateContestProblemListRequest,
  UpdateContestProblemListResponse,
} from "@/models/contest";

export type {
  ContestProblemEditItem,
  UpdateContestProblemListRequest,
  UpdateContestProblemListResponse,
};

export const updateContestProblemList = async (
  contestId: number,
  payload: UpdateContestProblemListRequest
): Promise<UpdateContestProblemListResponse> => {
  const res = await api.post<UpdateContestProblemListResponse>(
    contestEndpoints.updateProblemList(contestId),
    payload
  );
  return res.data;
};
