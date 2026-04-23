import { api } from "../api/axios";

export interface UnlinkProblemSetResponse {
  code: number;
  message: string;
}

export const unlinkProblemSet = async (
  classId: number,
  problemSetId: number
): Promise<UnlinkProblemSetResponse> => {
  const response = await api.delete(
    `/api/class/${classId}/problem_set/${problemSetId}`
  );
  return response.data;
};
