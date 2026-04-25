import { api } from "../api/axios";

export interface DeleteContestResponse {
  code: number;
  message: string;
  data: null;
}

export const deleteContest = async (
  contestId: number
): Promise<DeleteContestResponse> => {
  const response = await api.delete(`/api/contest/${contestId}`);
  return response.data;
};
