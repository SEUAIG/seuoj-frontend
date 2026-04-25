import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  IntroAttachmentInput,
  UpdateClassRequest,
  UpdateClassResponse,
} from "@/models/class";

export type { IntroAttachmentInput, UpdateClassRequest, UpdateClassResponse };

export const updateClass = async (
  classId: number,
  data: UpdateClassRequest
): Promise<UpdateClassResponse> => {
  const response = await api.put(classEndpoints.byId(classId), data);
  return response.data;
};
