import { api } from "../api/axios";

export type ContestRuleType = "NOI" | "IOI" | "ACM";
export type ContestStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";
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
  status?: ContestStatus;
  is_registered?: boolean;
  rule_type?: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
  problem_list: ContestProblemOverview[];
  can_write?: boolean;
};
export type ContestDetailResponse = {
  code: number;
  message: string;
  data?: ContestDetailData;
};

export const getContestDetail = async (
  contestId: number
): Promise<ContestDetailData | undefined> => {
  const res = await api.get<ContestDetailResponse>(
    `/api/contest/${contestId}`
  );
  return res.data.data;
};
