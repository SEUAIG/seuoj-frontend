import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestProblemOverview,
  ContestRuleType,
  ContestStandingsData,
  ContestStandingsQuery,
  ContestStandingsRecord,
  ContestStandingsResponse,
  ContestStandingsScoreDetail,
} from "@/models/contest";

export type {
  ContestProblemOverview,
  ContestRuleType,
  ContestStandingsData,
  ContestStandingsQuery,
  ContestStandingsRecord,
  ContestStandingsResponse,
  ContestStandingsScoreDetail,
};

export const getContestStandings = async (
  contestId: number,
  params: ContestStandingsQuery
): Promise<ContestStandingsData | undefined> => {
  const res = await api.get<ContestStandingsResponse>(
    contestEndpoints.standings(contestId),
    { params }
  );
  return res.data.data;
};
