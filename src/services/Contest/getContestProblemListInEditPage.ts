import { api } from "../api/axios";

export type ContestProblemOverviewInEditPage = {
  sort_order: number;
  pid: string;
  title: string;
};

export type ContestProblemListInEditPageData = {
  problem_list: ContestProblemOverviewInEditPage[];
};

export type ContestProblemListInEditPageResponse = {
  code: number;
  message: string;
  data?: ContestProblemListInEditPageData;
};

export const getContestProblemListInEditPage = async (
  contestId: number
): Promise<ContestProblemListInEditPageData | undefined> => {
  const res = await api.get<ContestProblemListInEditPageResponse>(
    `/api/contest/${contestId}/problem/list`
  );
  return res.data.data;
};
