import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  ClassMemberItem,
  ClassMemberPageResponse,
  GetClassMemberPageRequest,
} from "@/models/class";

export type { ClassMemberItem, ClassMemberPageResponse, GetClassMemberPageRequest };

export const getClassMemberPage = async (
  classId: number,
  params: GetClassMemberPageRequest
): Promise<ClassMemberPageResponse> => {
  const response = await api.get(classEndpoints.memberPage(classId), {
    params,
  });
  return response.data;
};
