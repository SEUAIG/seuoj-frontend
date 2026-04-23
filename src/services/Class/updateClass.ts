import { api } from "../api/axios";

export interface IntroAttachmentInput {
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
  introduction?: string;
  add_intro_attachments?: IntroAttachmentInput[];
  remove_intro_attachment_ids?: number[];
}

export interface UpdateClassResponse {
  code: number;
  message: string;
}

export const updateClass = async (
  classId: number,
  data: UpdateClassRequest
): Promise<UpdateClassResponse> => {
  const response = await api.put(`/api/class/${classId}`, data);
  return response.data;
};
