import { api } from "../api/axios";

export type ContestRuleType = "NOI" | "IOI" | "ACM";
export type ContestStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";
export type ContestListQuery = {
  current?: number;
  size?: number;
  status?: ContestStatus;
  title_keyword?: string;
  start_time?: string;
  end_time?: string;
  rule_type?: ContestRuleType;
};
export type ContestRecord = {
  contest_public_id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status?: ContestStatus;
  rule_type?: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
};
export type ContestPageData = {
  total?: number;
  current?: number;
  size?: number;
  records?: ContestRecord[];
};
export type ContestPageResponse = {
  code: number;
  message: string;
  data?: ContestPageData;
};

export const getContestPage = async (
  params: ContestListQuery
): Promise<ContestPageData | undefined> => {
  const res = await api.get<ContestPageResponse>("/api/contest/page", {
    params,
  });
  return res.data.data;
};
