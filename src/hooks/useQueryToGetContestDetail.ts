import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ContestDetailData,
  getContestDetail,
} from "@/services/Contest/getContestDetail";

export default function useQueryToGetContestDetail(
  contest_public_id: string,
  enabled: boolean = true
) {
  return useQuery<ContestDetailData | undefined>({
    queryKey: ["contestDetail", contest_public_id],
    queryFn: () => getContestDetail(contest_public_id),
    enabled: enabled && !!contest_public_id,
    placeholderData: keepPreviousData,
  });
}
