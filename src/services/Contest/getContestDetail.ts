import { api } from "../api/axios";

export type ContestRuleType = "NOI" | "IOI" | "ACM";
export type ContestProblemOverview = {
  sort_order: number;
  pid: string;
  title: string;
};
export type ContestDetailData = {
  title?: string;
  subtitle?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  rule_type?: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
  problem_list: ContestProblemOverview[];
};
export type ContestDetailResponse = {
  code: number;
  message: string;
  data?: ContestDetailData;
};

export const getContestDetail = async (
  contest_public_id: string
): Promise<ContestDetailData | undefined> => {
  const res = await api.get<ContestDetailResponse>(
    `/api/contest/${contest_public_id}`
  );
  return res.data.data;
};
