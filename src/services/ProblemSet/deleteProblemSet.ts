import { api } from "../api/axios";

export interface DeleteProblemSetResponse {
  code: number;
  message: string;
  data: null;
}

export const deleteProblemSet = async (
  problemSetId: number
): Promise<DeleteProblemSetResponse> => {
  const response = await api.delete(`/api/problem_set/${problemSetId}`);
  return response.data;
};
