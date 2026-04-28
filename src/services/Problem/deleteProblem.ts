import { api } from "../api/axios";
import { problemEndpoints } from "@/services/endpoints";
import type { DeleteProblemResponse } from "@/models/problem";

export type { DeleteProblemResponse };

export const deleteProblem = async (
  pid: string
): Promise<DeleteProblemResponse> => {
  const response = await api.delete(problemEndpoints.byPid(pid));
  return response.data;
};
