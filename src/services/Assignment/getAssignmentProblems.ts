import { api } from "../api/axios";
import type { ProblemItem } from "./getAssignmentDetail";

export interface AssignmentProblemsResponse {
  code: number;
  message: string;
  data: ProblemItem[];
}

export const getAssignmentProblems = async (
  classId: number,
  assignmentId: number
): Promise<AssignmentProblemsResponse> => {
  const response = await api.get(
    `/api/class/${classId}/assignment/${assignmentId}/problems`
  );
  return response.data;
};
