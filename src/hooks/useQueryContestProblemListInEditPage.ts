import { useQuery } from "@tanstack/react-query";
import {
  getContestProblemListInEditPage,
  ContestProblemListInEditPageData,
} from "@/services/Contest/getContestProblemListInEditPage";

export const useQueryContestProblemListInEditPage = (
  contest_public_id: string
) => {
  return useQuery<ContestProblemListInEditPageData | undefined>({
    queryKey: ["contest-problem-list-edit", contest_public_id],
    queryFn: () => getContestProblemListInEditPage(contest_public_id),
    enabled: !!contest_public_id,
  });
};
