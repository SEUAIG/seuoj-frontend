import { api } from "../api/axios";
import { problemSetEndpoints } from "@/services/endpoints";
import type {
  ProblemSetProblemPageData,
  ProblemSetProblemPageQuery,
  ProblemSetProblemPageResponse,
  ProblemSetProblemRecord,
} from "@/models/problemSet";

export type {
  ProblemSetProblemPageData,
  ProblemSetProblemPageQuery,
  ProblemSetProblemPageResponse,
  ProblemSetProblemRecord,
};

export const getProblemSetProblemPage = async (
  problem_set_id: string,
  params?: ProblemSetProblemPageQuery
): Promise<ProblemSetProblemPageData | undefined> => {
  const res = await api.get<ProblemSetProblemPageResponse>(
    problemSetEndpoints.problemPage(problem_set_id),
    { params }
  );
  return res.data.data;
};
