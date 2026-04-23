import { api } from "../api/axios";

export interface UnlinkContestResponse {
  code: number;
  message: string;
}

export const unlinkContest = async (
  classId: number,
  contestId: number
): Promise<UnlinkContestResponse> => {
  const response = await api.delete(
    `/api/class/${classId}/contest/${contestId}`
  );
  return response.data;
};
