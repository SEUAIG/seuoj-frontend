import { api } from "../api/axios";

export type ContestRuleType = "NOI" | "IOI" | "ACM";
export type ContestProblemOverview = {
  sort_order: number;
  pid: string;
  title: string;
};
export type ContestStandingsQuery = {
  current?: number;
  size?: number;
};
export type ContestStandingsScoreDetail = {
  score?: number | null;
  judge_id?: number;
  accepted?: boolean;
  unacceptedCount?: number;
  acceptedTime?: number;
  weighted_score?: number | null;
};
export type ContestStandingsRecord = {
  rank: number;
  username: string;
  nickname?: string;
  score: number;
  score_details: Record<string, ContestStandingsScoreDetail>;
};
export type ContestStandingsData = {
  contest_id: number;
  rule_type: ContestRuleType;
  problems: ContestProblemOverview[];
  records: ContestStandingsRecord[];
};
export type ContestStandingsResponse = {
  code: number;
  message: string;
  data?: ContestStandingsData;
};

export const getContestStandings = async (
  contestId: number,
  params: ContestStandingsQuery
): Promise<ContestStandingsData | undefined> => {
  const res = await api.get<ContestStandingsResponse>(
    `/api/contest/${contestId}/standings`,
    { params }
  );
  return res.data.data;
};
