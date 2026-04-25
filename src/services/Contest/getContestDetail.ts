import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestDetailData,
  ContestDetailResponse,
  ContestProblemOverview,
  ContestRuleType,
  ContestStatus,
} from "@/models/contest";

export type {
  ContestDetailData,
  ContestDetailResponse,
  ContestProblemOverview,
  ContestRuleType,
  ContestStatus,
};

export const getContestDetail = async (
  contestId: number
): Promise<ContestDetailData | undefined> => {
  const res = await api.get<ContestDetailResponse>(contestEndpoints.byId(contestId));
  return res.data.data;
};
