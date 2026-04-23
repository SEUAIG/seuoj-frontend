import { api } from "../api/axios";
import type { IntroAttachmentInput } from "../Class/updateClass";

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  introduction?: string;
  deadline?: string;
  visible_from?: string;
  visible_to?: string;
  problem_ids?: number[];
  intro_attachments?: IntroAttachmentInput[];
}

export interface CreateAssignmentResponse {
  code: number;
  message: string;
  data: {
    assignment_id: number;
  };
}

export const createAssignment = async (
  classId: number,
  data: CreateAssignmentRequest
): Promise<CreateAssignmentResponse> => {
  const response = await api.post(
    `/api/class/${classId}/assignment`,
    data
  );
  return response.data;
};
