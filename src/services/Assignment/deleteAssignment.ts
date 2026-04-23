import { api } from "../api/axios";

export interface DeleteAssignmentResponse {
  code: number;
  message: string;
  data: null;
}

export const deleteAssignment = async (
  classId: number,
  assignmentId: number
): Promise<DeleteAssignmentResponse> => {
  const response = await api.delete(
    `/api/class/${classId}/assignment/${assignmentId}`
  );
  return response.data;
};
