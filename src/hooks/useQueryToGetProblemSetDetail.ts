import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    ProblemSetDetailData,
    getProblemSetDetail,
} from "@/services/ProblemSet/getProblemSetDetail";

export default function useQueryToGetProblemSetDetail(
    problem_set_public_id: string,
    enabled: boolean = true
) {
    return useQuery<ProblemSetDetailData | undefined>({
        queryKey: ["problemSetDetail", problem_set_public_id],
        queryFn: () => getProblemSetDetail(problem_set_public_id),
        enabled: enabled && !!problem_set_public_id,
        placeholderData: keepPreviousData,
    });
}
