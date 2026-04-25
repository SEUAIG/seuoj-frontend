import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  AssignmentPageItem,
  AssignmentPageResponse,
} from "@/models/assignment";

export type { AssignmentPageItem, AssignmentPageResponse };

export const getAssignmentPage = async (
  classId: number,
  params: { current?: number; size?: number } = {}
): Promise<AssignmentPageResponse> => {
  const response = await api.get(assignmentEndpoints.page(classId), {
    params,
  });
  return response.data;
};
