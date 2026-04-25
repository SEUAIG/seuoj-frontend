import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestListQuery,
  ContestPageData,
  ContestPageResponse,
  ContestRecord,
  ContestRuleType,
  ContestStatus,
} from "@/models/contest";

export type {
  ContestListQuery,
  ContestPageData,
  ContestPageResponse,
  ContestRecord,
  ContestRuleType,
  ContestStatus,
};

export const getContestPage = async (
  params: ContestListQuery
): Promise<ContestPageData | undefined> => {
  const res = await api.get<ContestPageResponse>(contestEndpoints.page, {
    params,
  });
  return res.data.data;
};
