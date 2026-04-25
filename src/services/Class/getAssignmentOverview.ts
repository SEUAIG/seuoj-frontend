import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  AssignmentOverviewData,
  AssignmentOverviewResponse,
  ProblemStatItem,
  StudentStatItem,
} from "@/models/class";

export type {
  AssignmentOverviewData,
  AssignmentOverviewResponse,
  ProblemStatItem,
  StudentStatItem,
};

export const getAssignmentOverview = async (
  classId: number,
  assignmentId: number
): Promise<AssignmentOverviewResponse> => {
  const response = await api.get(
    classEndpoints.assignmentOverview(classId, assignmentId)
  );
  return response.data;
};
