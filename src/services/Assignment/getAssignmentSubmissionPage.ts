import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  AssignmentSubmissionPageRequest,
  AssignmentSubmissionPageResponse,
} from "@/models/assignment";

export type { AssignmentSubmissionPageRequest, AssignmentSubmissionPageResponse };

export const getAssignmentSubmissionPage = async (
  classId: number,
  assignmentId: number,
  params: AssignmentSubmissionPageRequest
): Promise<AssignmentSubmissionPageResponse> => {
  const response = await api.get(
    assignmentEndpoints.submissionPage(classId, assignmentId),
    { params }
  );
  return response.data;
};
