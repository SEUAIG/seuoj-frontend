import { useQuery } from "@tanstack/react-query";
import {
  getContestProblemListInEditPage,
  ContestProblemListInEditPageData,
} from "@/services/Contest/getContestProblemListInEditPage";

export const useQueryContestProblemListInEditPage = (
  contestId: number
) => {
  return useQuery<ContestProblemListInEditPageData | undefined>({
    queryKey: ["contest-problem-list-edit", contestId],
    queryFn: () => getContestProblemListInEditPage(contestId),
    enabled: !!contestId,
  });
};
