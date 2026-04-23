import { api } from "../api/axios";

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  add_attachments?: { file_path: string; file_name: string; file_size: number }[];
  remove_attachment_ids?: number[];
}

export const updateAnnouncement = async (
  classId: number,
  announcementId: number,
  body: UpdateAnnouncementRequest
): Promise<{ code: number; message: string }> => {
  const response = await api.put(
    `/api/class/${classId}/announcement/${announcementId}`,
    body
  );
  return response.data;
};
