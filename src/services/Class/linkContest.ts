import { api } from "../api/axios";

export interface LinkContestResponse {
  code: number;
  message: string;
}

export const linkContest = async (
  class_public_id: string,
  contest_public_id: string
): Promise<LinkContestResponse> => {
  const response = await api.put(
    `/api/class/${class_public_id}/contest/${contest_public_id}`
  );
  return response.data;
};
