import { api } from "../api/axios";
import type { IntroAttachmentInput } from "../Class/updateClass";

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  introduction?: string;
  status?: "DRAFT" | "PUBLISHED" | "CLOSED";
  deadline?: string;
  visible_from?: string;
  visible_to?: string;
  add_intro_attachments?: IntroAttachmentInput[];
  remove_intro_attachment_ids?: number[];
}

export interface UpdateAssignmentResponse {
  code: number;
  message: string;
  data: null;
}

export const updateAssignment = async (
  classId: number,
  assignmentId: number,
  data: UpdateAssignmentRequest
): Promise<UpdateAssignmentResponse> => {
  const response = await api.put(
    `/api/class/${classId}/assignment/${assignmentId}`,
    data
  );
  return response.data;
};
