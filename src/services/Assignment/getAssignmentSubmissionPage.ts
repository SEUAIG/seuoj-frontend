import { api } from "../api/axios";
import type { SubmissionListItem } from "../Submission/getSubmissionPage";

export interface AssignmentSubmissionPageRequest {
  current?: number;
  size?: number;
}

export interface AssignmentSubmissionPageResponse {
  code: number;
  message: string;
  data: {
    total: number;
    size: number;
    current: number;
    records: SubmissionListItem[];
  };
}

export const getAssignmentSubmissionPage = async (
  classId: number,
  assignmentId: number,
  params: AssignmentSubmissionPageRequest
): Promise<AssignmentSubmissionPageResponse> => {
  const response = await api.get(
    `/api/class/${classId}/assignment/${assignmentId}/submission/page`,
    { params }
  );
  return response.data;
};
