import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { RemoveMemberResponse } from "@/models/class";

export type { RemoveMemberResponse };

export const removeMember = async (
  classId: number,
  userId: number
): Promise<RemoveMemberResponse> => {
  const response = await api.delete(classEndpoints.member(classId, userId));
  return response.data;
};
