import { api } from "../api/axios";

export interface ProblemItem {
  problem_id: number;
  pid: string;
  title: string;
  sort_order: number;
  weight: number;
}

export interface AssignmentIntroAttachment {
  id: number;
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface AssignmentDetailData {
  assignment_id: number;
  class_id: number;
  title: string;
  description: string | null;
  introduction: string | null;
  intro_attachments: AssignmentIntroAttachment[];
  status: "DRAFT" | "PUBLISHED";
  deadline: string | null;
  visible_from: string | null;
  visible_to: string | null;
  problem_count: number;
  member_count: number;
  avg_completion_rate: number | null;
  can_write?: boolean;
  problems: ProblemItem[];
}

export interface AssignmentDetailResponse {
  code: number;
  message: string;
  data: AssignmentDetailData;
}

export const getAssignmentDetail = async (
  classId: number,
  assignmentId: number
): Promise<AssignmentDetailResponse> => {
  const response = await api.get(
    `/api/class/${classId}/assignment/${assignmentId}`
  );
  return response.data;
};
