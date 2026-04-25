import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type { DeleteContestResponse } from "@/models/contest";

export type { DeleteContestResponse };

export const deleteContest = async (
  contestId: number
): Promise<DeleteContestResponse> => {
  const response = await api.delete(contestEndpoints.byId(contestId));
  return response.data;
};
