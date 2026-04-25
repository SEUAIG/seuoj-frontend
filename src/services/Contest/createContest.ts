import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestRuleType,
  CreateContestRequest,
  CreateContestResponse,
} from "@/models/contest";

export type { ContestRuleType, CreateContestRequest, CreateContestResponse };

export const createContest = async (
  payload: CreateContestRequest
): Promise<CreateContestResponse> => {
  const res = await api.post<CreateContestResponse>(contestEndpoints.create, payload);
  return res.data;
};
