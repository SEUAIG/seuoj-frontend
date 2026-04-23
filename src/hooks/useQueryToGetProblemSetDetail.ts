import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    ProblemSetDetailData,
    getProblemSetDetail,
} from "@/services/ProblemSet/getProblemSetDetail";

export default function useQueryToGetProblemSetDetail(
    problemSetId: number,
    enabled: boolean = true
) {
    return useQuery<ProblemSetDetailData | undefined>({
        queryKey: ["problemSetDetail", problemSetId],
        queryFn: () => getProblemSetDetail(problemSetId),
        enabled: enabled && !!problemSetId,
        placeholderData: keepPreviousData,
    });
}
