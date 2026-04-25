import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type { AssignmentProgressResponse } from "@/models/assignment";

export type { AssignmentProgressResponse };

export const getAssignmentProgress = async (
  classId: number
): Promise<AssignmentProgressResponse> => {
  const response = await api.get(assignmentEndpoints.progress(classId));
  return response.data;
};
