import { api } from "../api/axios";

export interface UnlinkContestResponse {
  code: number;
  message: string;
}

export const unlinkContest = async (
  class_public_id: string,
  contest_public_id: string
): Promise<UnlinkContestResponse> => {
  const response = await api.delete(
    `/api/class/${class_public_id}/contest/${contest_public_id}`
  );
  return response.data;
};
