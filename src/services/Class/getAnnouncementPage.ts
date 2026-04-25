import { api } from "../api/axios";
import { assignmentEndpoints, classEndpoints } from "@/services/endpoints";
import type {
  AnnouncementItem,
  AnnouncementPageResponse,
  AttachmentItem,
  PaginationQuery,
} from "@/models/class";

export type {
  AnnouncementItem,
  AnnouncementPageResponse,
  AttachmentItem,
  PaginationQuery,
};

export const getAnnouncementPage = async (
  classId: number,
  params: PaginationQuery
): Promise<AnnouncementPageResponse> => {
  const response = await api.get(classEndpoints.announcementPage(classId), {
    params,
  });
  return response.data;
};

export const getAssignmentAnnouncementPage = async (
  classId: number,
  assignmentId: number,
  params: PaginationQuery
): Promise<AnnouncementPageResponse> => {
  const response = await api.get(
    assignmentEndpoints.announcementPage(classId, assignmentId),
    { params }
  );
  return response.data;
};
