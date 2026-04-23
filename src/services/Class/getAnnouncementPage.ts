import { api } from "../api/axios";

export interface AttachmentItem {
  id: number;
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface AnnouncementItem {
  announcement_id: number;
  title: string;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  created_by_user_id: number;
  created_by_username: string;
  created_by_nickname?: string;
  attachments: AttachmentItem[];
}

export interface AnnouncementPageResponse {
  code: number;
  message: string;
  data: {
    current: number;
    size: number;
    total: number;
    records: AnnouncementItem[];
  };
}

export const getAnnouncementPage = async (
  classId: number,
  params: { current?: number; size?: number }
): Promise<AnnouncementPageResponse> => {
  const response = await api.get(
    `/api/class/${classId}/announcement/page`,
    { params }
  );
  return response.data;
};

export const getAssignmentAnnouncementPage = async (
  classId: number,
  assignmentId: number,
  params: { current?: number; size?: number }
): Promise<AnnouncementPageResponse> => {
  const response = await api.get(
    `/api/class/${classId}/assignment/${assignmentId}/announcement/page`,
    { params }
  );
  return response.data;
};
