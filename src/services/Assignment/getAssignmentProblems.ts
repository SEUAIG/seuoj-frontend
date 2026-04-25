import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  AssignmentProblemsResponse,
  AssignmentProblemItem,
} from "@/models/assignment";

export type ProblemItem = AssignmentProblemItem;
export type { AssignmentProblemsResponse };

export const getAssignmentProblems = async (
  classId: number,
  assignmentId: number
): Promise<AssignmentProblemsResponse> => {
  const response = await api.get(
    assignmentEndpoints.problems(classId, assignmentId)
  );
  return response.data;
};
