import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  ClassDetailData,
  ClassDetailResponse,
  ClassIntroAttachment,
} from "@/models/class";

export type { ClassDetailData, ClassDetailResponse, ClassIntroAttachment };

export const getClassDetail = async (
  classId: number
): Promise<ClassDetailResponse> => {
  const response = await api.get(classEndpoints.byId(classId));
  return response.data;
};
