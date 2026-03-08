import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    ProblemSetListQuery,
    ProblemSetPageData,
    getProblemSetPage,
} from "@/services/ProblemSet/getProblemSetPage";

export default function useQueryToGetProblemSetList(
    params: ProblemSetListQuery
) {
    return useQuery<ProblemSetPageData | undefined>({
        queryKey: ["problemSetPage", params],
        queryFn: () => getProblemSetPage(params),
        placeholderData: keepPreviousData,
    });
}
