import { api } from "../api/axios";

export interface AssignmentPageItem {
  id: number;
  class_id: number;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  deadline: string | null;
  visible_from: string | null;
  visible_to: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentPageResponse {
  code: number;
  message: string;
  data: {
    current: number;
    size: number;
    total: number;
    records: AssignmentPageItem[];
  };
}

export const getAssignmentPage = async (
  classId: number,
  params: { current?: number; size?: number } = {}
): Promise<AssignmentPageResponse> => {
  const response = await api.get(`/api/class/${classId}/assignment/page`, {
    params,
  });
  return response.data;
};
