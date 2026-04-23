import { api } from "../api/axios";

export interface UpdateContestRequest {
  title?: string;
  subtitle?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  rule_type?: "NOI" | "IOI" | "ACM";
  is_public?: boolean;
  hide_statistics?: boolean;
}

export interface UpdateContestResponse {
  code: number;
  message: string;
}

export const updateContest = async (
  contestId: number,
  data: UpdateContestRequest
): Promise<UpdateContestResponse> => {
  const res = await api.put<UpdateContestResponse>(
    `/api/contest/${contestId}`,
    data
  );
  return res.data;
};
