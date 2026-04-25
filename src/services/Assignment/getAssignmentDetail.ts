import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  AssignmentDetailData,
  AssignmentDetailResponse,
  AssignmentIntroAttachment,
  AssignmentProblemItem,
} from "@/models/assignment";

export type ProblemItem = AssignmentProblemItem;
export type {
  AssignmentDetailData,
  AssignmentDetailResponse,
  AssignmentIntroAttachment,
};

export const getAssignmentDetail = async (
  classId: number,
  assignmentId: number
): Promise<AssignmentDetailResponse> => {
  const response = await api.get(assignmentEndpoints.byId(classId, assignmentId));
  return response.data;
};
