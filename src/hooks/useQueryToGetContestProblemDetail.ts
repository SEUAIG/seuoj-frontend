import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ContestProblemDetailData,
  getContestProblemDetail,
} from "@/services/Contest/getContestProblemDetail";

export default function useQueryToGetContestProblemDetail(
  contest_public_id: string,
  pid: string,
  enabled: boolean = true
) {
  return useQuery<ContestProblemDetailData | undefined>({
    queryKey: ["contestProblemDetail", contest_public_id, pid],
    queryFn: () => getContestProblemDetail(contest_public_id, pid),
    enabled: enabled && !!contest_public_id && !!pid,
    placeholderData: keepPreviousData,
  });
}
