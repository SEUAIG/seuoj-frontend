import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { JoinClassResponse } from "@/models/class";

export type { JoinClassResponse };

export const joinClass = async (
  classId: number
): Promise<JoinClassResponse> => {
  const response = await api.post(classEndpoints.join(classId));
  return response.data;
};
