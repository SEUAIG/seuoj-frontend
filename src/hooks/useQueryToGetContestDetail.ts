import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ContestDetailData,
  getContestDetail,
} from "@/services/Contest/getContestDetail";

export default function useQueryToGetContestDetail(
  contestId: number,
  enabled: boolean = true
) {
  return useQuery<ContestDetailData | undefined>({
    queryKey: ["contestDetail", contestId],
    queryFn: () => getContestDetail(contestId),
    enabled: enabled && !!contestId,
    placeholderData: keepPreviousData,
  });
}
