import { api } from "@/services/api/axios";
import { problemEndpoints } from "@/services/endpoints";
import type {
  NextProblemIdResponse,
  ProblemDetailQuery,
  ProblemDetailResponse,
} from "@/models/problem";

export const getProblemDetail = async (
  pid: string,
  params?: ProblemDetailQuery
): Promise<ProblemDetailResponse> => {
  const res = await api.get<ProblemDetailResponse>(problemEndpoints.byPid(pid), {
    params,
  });
  return res.data;
};

export const getNextProblemId = async (): Promise<NextProblemIdResponse> => {
  const res = await api.get<NextProblemIdResponse>(problemEndpoints.nextId);
  return res.data;
};
