import { api } from "../api/axios";

export interface UnlinkProblemSetResponse {
  code: number;
  message: string;
}

export const unlinkProblemSet = async (
  class_public_id: string,
  problem_set_id: string
): Promise<UnlinkProblemSetResponse> => {
  const response = await api.delete(
    `/api/class/${class_public_id}/problem_set/${problem_set_id}`
  );
  return response.data;
};
