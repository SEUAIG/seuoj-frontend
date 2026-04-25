import { api } from "../api/axios";
import { problemSetEndpoints } from "@/services/endpoints";
import type { DeleteProblemSetResponse } from "@/models/problemSet";

export type { DeleteProblemSetResponse };

export const deleteProblemSet = async (
  problemSetId: number
): Promise<DeleteProblemSetResponse> => {
  const response = await api.delete(problemSetEndpoints.byId(problemSetId));
  return response.data;
};
