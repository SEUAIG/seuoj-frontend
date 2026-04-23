import { api } from "../api/axios";

export interface AssignmentProgressItem {
  assignment_id: number;
  title: string;
  status: string;
  deadline: string | null;
  problem_count: number;
  avg_completion_rate: number;
}

export interface StudentOverviewItem {
  user_id: number;
  username: string;
  nickname?: string;
  ac_count: number;
  submit_count: number;
}

export interface ClassOverviewData {
  member_count: number;
  total_problems: number;
  assignments: AssignmentProgressItem[];
  students: StudentOverviewItem[];
}

export interface ClassOverviewResponse {
  code: number;
  message: string;
  data: ClassOverviewData;
}

export const getClassOverview = async (
  classId: number
): Promise<ClassOverviewResponse> => {
  const response = await api.get(`/api/class/${classId}/overview`);
  return response.data;
};
