import { api } from "../api/axios";

export interface ImportFromProblemSetRequest {
  problem_set_id: number;
}

export interface ImportFromProblemSetResponse {
  code: number;
  message: string;
  data: null;
}

export const importFromProblemSet = async (
  classId: number,
  assignmentId: number,
  data: ImportFromProblemSetRequest
): Promise<ImportFromProblemSetResponse> => {
  const response = await api.post(
    `/api/class/${classId}/assignment/${assignmentId}/import`,
    data
  );
  return response.data;
};
