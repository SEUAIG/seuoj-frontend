import { api } from "../api/axios";

export interface CreateAnnouncementRequest {
  title: string;
  content?: string;
  is_pinned?: boolean;
  attachments?: { file_path: string; file_name: string; file_size: number }[];
}

export interface CreateAnnouncementResponse {
  code: number;
  message: string;
  data: { announcement_id: number };
}

export const createAnnouncement = async (
  classId: number,
  body: CreateAnnouncementRequest
): Promise<CreateAnnouncementResponse> => {
  const response = await api.post(
    `/api/class/${classId}/announcement`,
    body
  );
  return response.data;
};

export const createAssignmentAnnouncement = async (
  classId: number,
  assignmentId: number,
  body: CreateAnnouncementRequest
): Promise<CreateAnnouncementResponse> => {
  const response = await api.post(
    `/api/class/${classId}/assignment/${assignmentId}/announcement`,
    body
  );
  return response.data;
};
