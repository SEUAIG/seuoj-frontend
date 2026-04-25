import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { UpdateAnnouncementRequest } from "@/models/class";

export type { UpdateAnnouncementRequest };

export const updateAnnouncement = async (
  classId: number,
  announcementId: number,
  body: UpdateAnnouncementRequest
): Promise<{ code: number; message: string }> => {
  const response = await api.put(
    classEndpoints.announcementById(classId, announcementId),
    body
  );
  return response.data;
};
