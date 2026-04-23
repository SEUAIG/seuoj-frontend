import { api } from "../api/axios";

export interface LinkProblemSetResponse {
  code: number;
  message: string;
}

export const linkProblemSet = async (
  classId: number,
  problemSetId: number
): Promise<LinkProblemSetResponse> => {
  const response = await api.put(
    `/api/class/${classId}/problem_set/${problemSetId}`
  );
  return response.data;
};
