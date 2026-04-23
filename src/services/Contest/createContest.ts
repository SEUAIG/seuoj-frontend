import { api } from "../api/axios";

export type ContestRuleType = "NOI" | "IOI" | "ACM";
export type CreateContestRequest = {
  title: string;
  subtitle?: string;
  description?: string;
  start_time: string;
  end_time: string;
  rule_type: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
};
export type CreateContestResponse = {
  code: number;
  message: string;
  data?: {
    contest_id: number;
  };
};

export const createContest = async (
  payload: CreateContestRequest
): Promise<CreateContestResponse> => {
  const res = await api.post<CreateContestResponse>("/api/contest", payload);
  return res.data;
};
