import { api } from "../api/axios";

export type ContestProblemOverview = {
  sort_order: number;
  pid: string;
  title: string;
};
export type ContestProblemListData = {
  problem_list: ContestProblemOverview[];
};
export type ContestProblemListResponse = {
  code: number;
  message: string;
  data?: ContestProblemListData;
};

export const getContestProblemList = async (
  contest_public_id: string
): Promise<ContestProblemListData | undefined> => {
  const res = await api.get<ContestProblemListResponse>(
    `/api/contest/${contest_public_id}/problem/page`
  );
  return res.data.data;
};
