import { api } from "../api/axios";

export interface ProblemEditItem {
  problem_id: number;
  weight?: number;
}

export interface ReplaceAssignmentProblemsRequest {
  problems: ProblemEditItem[];
}

export interface ReplaceAssignmentProblemsResponse {
  code: number;
  message: string;
  data: null;
}

export const replaceAssignmentProblems = async (
  classId: number,
  assignmentId: number,
  data: ReplaceAssignmentProblemsRequest
): Promise<ReplaceAssignmentProblemsResponse> => {
  const response = await api.put(
    `/api/class/${classId}/assignment/${assignmentId}/problems`,
    data
  );
  return response.data;
};
