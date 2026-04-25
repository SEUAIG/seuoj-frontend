import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  CreateAnnouncementRequest,
  CreateAnnouncementResponse,
} from "@/models/class";

export type { CreateAnnouncementRequest, CreateAnnouncementResponse };

export const createAnnouncement = async (
  classId: number,
  body: CreateAnnouncementRequest
): Promise<CreateAnnouncementResponse> => {
  const response = await api.post(classEndpoints.createAnnouncement(classId), body);
  return response.data;
};

export const createAssignmentAnnouncement = async (
  classId: number,
  assignmentId: number,
  body: CreateAnnouncementRequest
): Promise<CreateAnnouncementResponse> => {
  const response = await api.post(
    classEndpoints.createAssignmentAnnouncement(classId, assignmentId),
    body
  );
  return response.data;
};
