import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";

export const deleteAnnouncement = async (
  classId: number,
  announcementId: number
): Promise<{ code: number; message: string }> => {
  const response = await api.delete(
    classEndpoints.announcementById(classId, announcementId)
  );
  return response.data;
};
