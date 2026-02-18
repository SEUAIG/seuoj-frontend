import { api } from "../api/axios";

export type ContestProblemEditItem = {
  pid: string;
  sort_order: number;
};
export type UpdateContestProblemListRequest = {
  problem_list: ContestProblemEditItem[];
};
export type UpdateContestProblemListResponse = {
  code: number;
  message: string;
};

export const updateContestProblemList = async (
  contest_public_id: string,
  payload: UpdateContestProblemListRequest
): Promise<UpdateContestProblemListResponse> => {
  const res = await api.post<UpdateContestProblemListResponse>(
    `/api/contest/${contest_public_id}/problem`,
    payload
  );
  return res.data;
};
