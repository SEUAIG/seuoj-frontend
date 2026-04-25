import { api } from "@/services/api/axios";
import { problemEndpoints } from "@/services/endpoints";
import type { ProblemStatisticsResponse } from "@/models/problem";

export const getProblemStatistics = async (
  pid: string
): Promise<ProblemStatisticsResponse> => {
  const res = await api.get<ProblemStatisticsResponse>(
    problemEndpoints.statistics(pid)
  );
  return res.data;
};
