import { api } from "../api/axios";

export type ContestRuleType = "NOI" | "IOI" | "ACM";
export type UpdateContestRequest = {
  title?: string;
  subtitle?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  rule_type?: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
};
export type UpdateContestResponse = {
  code: number;
  message: string;
};

export const updateContest = async (
  contest_public_id: string,
  payload: UpdateContestRequest
): Promise<UpdateContestResponse> => {
  const res = await api.put<UpdateContestResponse>(
    `/api/contest/${contest_public_id}`,
    payload
  );
  return res.data;
};
