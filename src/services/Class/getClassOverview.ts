import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  AssignmentProgressItem,
  ClassOverviewData,
  ClassOverviewResponse,
  StudentOverviewItem,
} from "@/models/class";

export type {
  AssignmentProgressItem,
  ClassOverviewData,
  ClassOverviewResponse,
  StudentOverviewItem,
};

export const getClassOverview = async (
  classId: number
): Promise<ClassOverviewResponse> => {
  const response = await api.get(classEndpoints.overview(classId));
  return response.data;
};
