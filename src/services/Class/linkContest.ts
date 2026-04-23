import { api } from "../api/axios";

export interface LinkContestResponse {
  code: number;
  message: string;
}

export const linkContest = async (
  classId: number,
  contestId: number
): Promise<LinkContestResponse> => {
  const response = await api.put(
    `/api/class/${classId}/contest/${contestId}`
  );
  return response.data;
};
