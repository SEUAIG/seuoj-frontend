import { api } from "../api/axios";
import { problemSetEndpoints } from "@/services/endpoints";
import type {
  ProblemSetListQuery,
  ProblemSetPageData,
  ProblemSetPageResponse,
  ProblemSetRecord,
} from "@/models/problemSet";

export type {
  ProblemSetListQuery,
  ProblemSetPageData,
  ProblemSetPageResponse,
  ProblemSetRecord,
};

export const getProblemSetPage = async (
  params: ProblemSetListQuery
): Promise<ProblemSetPageData | undefined> => {
  const res = await api.get<ProblemSetPageResponse>(problemSetEndpoints.page, {
    params,
  });
  return res.data.data;
};
