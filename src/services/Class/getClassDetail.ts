import { api } from "../api/axios";

export interface ClassIntroAttachment {
  id: number;
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface ClassDetailData {
  class_id: number;
  name: string;
  description: string;
  introduction: string | null;
  intro_attachments: ClassIntroAttachment[];
  creator_id: number;
  is_public: boolean;
  can_write?: boolean;
}

export interface ClassDetailResponse {
  code: number;
  message: string;
  data: ClassDetailData;
}

export const getClassDetail = async (
  classId: number
): Promise<ClassDetailResponse> => {
  const response = await api.get(`/api/class/${classId}`);
  return response.data;
};
