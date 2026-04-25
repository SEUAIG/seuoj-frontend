import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestProblemListInEditPageData,
  ContestProblemListInEditPageResponse,
  ContestProblemOverviewInEditPage,
} from "@/models/contest";

export type {
  ContestProblemListInEditPageData,
  ContestProblemListInEditPageResponse,
  ContestProblemOverviewInEditPage,
};

export const getContestProblemListInEditPage = async (
  contestId: number
): Promise<ContestProblemListInEditPageData | undefined> => {
  const res = await api.get<ContestProblemListInEditPageResponse>(
    contestEndpoints.problemListInEdit(contestId)
  );
  return res.data.data;
};
