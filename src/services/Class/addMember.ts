import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { AddMemberResponse } from "@/models/class";

export type { AddMemberResponse };

export const addMember = async (
  classId: number,
  userId: number
): Promise<AddMemberResponse> => {
  const response = await api.post(classEndpoints.member(classId, userId));
  return response.data;
};
