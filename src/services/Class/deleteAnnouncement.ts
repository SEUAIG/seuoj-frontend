import { api } from "../api/axios";

export const deleteAnnouncement = async (
  classId: number,
  announcementId: number
): Promise<{ code: number; message: string }> => {
  const response = await api.delete(
    `/api/class/${classId}/announcement/${announcementId}`
  );
  return response.data;
};
