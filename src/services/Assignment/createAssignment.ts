import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  CreateAssignmentRequest,
  CreateAssignmentResponse,
} from "@/models/assignment";

export type { CreateAssignmentRequest, CreateAssignmentResponse };

export const createAssignment = async (
  classId: number,
  data: CreateAssignmentRequest
): Promise<CreateAssignmentResponse> => {
  const response = await api.post(assignmentEndpoints.create(classId), data);
  return response.data;
};
