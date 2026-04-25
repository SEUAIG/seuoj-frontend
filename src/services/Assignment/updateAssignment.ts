import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  UpdateAssignmentRequest,
  UpdateAssignmentResponse,
} from "@/models/assignment";

export type { UpdateAssignmentRequest, UpdateAssignmentResponse };

export const updateAssignment = async (
  classId: number,
  assignmentId: number,
  data: UpdateAssignmentRequest
): Promise<UpdateAssignmentResponse> => {
  const response = await api.put(
    assignmentEndpoints.byId(classId, assignmentId),
    data
  );
  return response.data;
};
