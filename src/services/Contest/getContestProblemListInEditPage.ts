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
  contest_public_id: string
): Promise<ContestProblemListInEditPageData | undefined> => {
  const res = await api.get<ContestProblemListInEditPageResponse>(
    `/api/contest/${contest_public_id}/problem/list`
  );
  return res.data.data;
};
