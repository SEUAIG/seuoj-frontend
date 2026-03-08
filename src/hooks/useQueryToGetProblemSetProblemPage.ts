import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    ProblemSetProblemPageQuery,
    ProblemSetProblemPageData,
    getProblemSetProblemPage,
} from "@/services/ProblemSet/getProblemSetProblemPage";

export default function useQueryToGetProblemSetProblemPage(
    problem_set_id: string,
    params?: ProblemSetProblemPageQuery,
    enabled: boolean = true
) {
    return useQuery<ProblemSetProblemPageData | undefined>({
        queryKey: ["problemSetProblemPage", problem_set_id, params],
        queryFn: () => getProblemSetProblemPage(problem_set_id, params),
        enabled: enabled && !!problem_set_id,
        placeholderData: keepPreviousData,
    });
}
