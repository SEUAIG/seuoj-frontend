import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ContestListQuery,
  ContestPageData,
  getContestPage,
} from "@/services/Contest/getContestPage";

export default function useQueryToGetContestList(
  params: ContestListQuery,
  enabled: boolean
) {
  return useQuery<ContestPageData | undefined>({
    queryKey: ["contestPage", params],
    queryFn: () => getContestPage(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
