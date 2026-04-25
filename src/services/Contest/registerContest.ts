import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type { RegisterContestResponse } from "@/models/contest";

export type { RegisterContestResponse };

export const registerContest = async (
  contestId: number
): Promise<RegisterContestResponse> => {
  const res = await api.post<RegisterContestResponse>(
    contestEndpoints.registerWithQuery(contestId)
  );
  return res.data;
};

export const unregisterContest = async (
  contestId: number
): Promise<RegisterContestResponse> => {
  const res = await api.delete<RegisterContestResponse>(
    contestEndpoints.registerWithQuery(contestId)
  );
  return res.data;
};
