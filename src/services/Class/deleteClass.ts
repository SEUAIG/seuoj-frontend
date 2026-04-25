import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { DeleteClassResponse } from "@/models/class";

export type { DeleteClassResponse };

export const deleteClass = async (
  classId: number
): Promise<DeleteClassResponse> => {
  const response = await api.delete(classEndpoints.byId(classId));
  return response.data;
};
