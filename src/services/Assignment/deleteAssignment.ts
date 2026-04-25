import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type { DeleteAssignmentResponse } from "@/models/assignment";

export type { DeleteAssignmentResponse };

export const deleteAssignment = async (
  classId: number,
  assignmentId: number
): Promise<DeleteAssignmentResponse> => {
  const response = await api.delete(
    assignmentEndpoints.byId(classId, assignmentId)
  );
  return response.data;
};
