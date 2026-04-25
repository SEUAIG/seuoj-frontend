import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  AssignmentProblemEditItem,
  ReplaceAssignmentProblemsRequest,
  ReplaceAssignmentProblemsResponse,
} from "@/models/assignment";

export type ProblemEditItem = AssignmentProblemEditItem;
export type {
  ReplaceAssignmentProblemsRequest,
  ReplaceAssignmentProblemsResponse,
};

export const replaceAssignmentProblems = async (
  classId: number,
  assignmentId: number,
  data: ReplaceAssignmentProblemsRequest
): Promise<ReplaceAssignmentProblemsResponse> => {
  const response = await api.put(
    assignmentEndpoints.problems(classId, assignmentId),
    data
  );
  return response.data;
};
