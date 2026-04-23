import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ContestProblemDetailData,
  getContestProblemDetail,
} from "@/services/Contest/getContestProblemDetail";

export default function useQueryToGetContestProblemDetail(
  contestId: number,
  pid: string,
  enabled: boolean = true
) {
  return useQuery<ContestProblemDetailData | undefined>({
    queryKey: ["contestProblemDetail", contestId, pid],
    queryFn: () => getContestProblemDetail(contestId, pid),
    enabled: enabled && !!contestId && !!pid,
    placeholderData: keepPreviousData,
  });
}
