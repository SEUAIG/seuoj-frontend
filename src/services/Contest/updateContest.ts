import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type { UpdateContestRequest, UpdateContestResponse } from "@/models/contest";

export type { UpdateContestRequest, UpdateContestResponse };

export const updateContest = async (
  contestId: number,
  data: UpdateContestRequest
): Promise<UpdateContestResponse> => {
  const res = await api.put<UpdateContestResponse>(
    contestEndpoints.byId(contestId),
    data
  );
  return res.data;
};
