import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestUnregisterQuery,
  ContestUnregisterResponse,
} from "@/models/contest";

export type { ContestUnregisterQuery, ContestUnregisterResponse };

export const unregisterContest = async (
  params: ContestUnregisterQuery
): Promise<ContestUnregisterResponse> => {
  const res = await api.delete<ContestUnregisterResponse>(contestEndpoints.register, {
    params,
  });
  return res.data;
};
