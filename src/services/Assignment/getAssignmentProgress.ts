import { api } from "../api/axios";
import type { AssignmentProgressItem } from "../Class/getClassOverview";

export interface AssignmentProgressResponse {
  code: number;
  message: string;
  data: AssignmentProgressItem[];
}

export const getAssignmentProgress = async (
  classId: number
): Promise<AssignmentProgressResponse> => {
  const response = await api.get(`/api/class/${classId}/assignment/progress`);
  return response.data;
};
