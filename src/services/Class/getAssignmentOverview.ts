import { api } from "../api/axios";

export interface ProblemStatItem {
  pid: string;
  title: string;
  weight: number;
  ac_count: number;
  attempt_count: number;
  ac_rate: number;
}

export interface StudentStatItem {
  user_id: number;
  username: string;
  ac_count: number;
  problem_count: number;
  submitted_before_deadline: boolean;
}

export interface AssignmentOverviewData {
  assignment_id: number;
  title: string;
  deadline: string | null;
  member_count: number;
  problem_count: number;
  avg_completion_rate: number;
  problems: ProblemStatItem[];
  students: StudentStatItem[];
}

export interface AssignmentOverviewResponse {
  code: number;
  message: string;
  data: AssignmentOverviewData;
}

export const getAssignmentOverview = async (
  classId: number,
  assignmentId: number
): Promise<AssignmentOverviewResponse> => {
  const response = await api.get(
    `/api/class/${classId}/overview/assignment/${assignmentId}`
  );
  return response.data;
};
