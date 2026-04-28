import { api } from "@/services/api/axios";
import { problemEndpoints } from "@/services/endpoints";
import type {
  NextProblemIdResponse,
  ProblemDetailQuery,
  ProblemDetailResponse,
} from "@/models/problem";
import axios from "axios";

export const getProblemDetail = async (
  pid: string,
  params?: ProblemDetailQuery
): Promise<ProblemDetailResponse> => {
  try {
    const res = await api.get<ProblemDetailResponse>(problemEndpoints.byPid(pid), {
      params,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data as ProblemDetailResponse;
    }
    throw error;
  }
};

export const getNextProblemId = async (): Promise<NextProblemIdResponse> => {
  const res = await api.get<NextProblemIdResponse>(problemEndpoints.nextId);
  return res.data;
};
