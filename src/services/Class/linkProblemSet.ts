import { api } from "../api/axios";

export interface LinkProblemSetResponse {
  code: number;
  message: string;
}

export const linkProblemSet = async (
  class_public_id: string,
  problem_set_id: string
): Promise<LinkProblemSetResponse> => {
  const response = await api.put(
    `/api/class/${class_public_id}/problem_set/${problem_set_id}`
  );
  return response.data;
};
