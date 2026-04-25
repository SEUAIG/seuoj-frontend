import { api } from "../api/axios";
import { problemSetEndpoints } from "@/services/endpoints";
import type {
  ProblemSetDetailData,
  ProblemSetDetailResponse,
  ProblemSetProblemItem,
} from "@/models/problemSet";

export type { ProblemSetDetailData, ProblemSetDetailResponse, ProblemSetProblemItem };

export const getProblemSetDetail = async (
  problemSetId: number
): Promise<ProblemSetDetailData | undefined> => {
  const res = await api.get<ProblemSetDetailResponse>(
    problemSetEndpoints.byId(problemSetId)
  );
  return res.data.data;
};
