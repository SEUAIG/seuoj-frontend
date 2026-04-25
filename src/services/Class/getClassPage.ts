import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  ClassItem,
  ClassPageResponse,
  GetClassPageRequest,
} from "@/models/class";

export type { ClassItem, ClassPageResponse, GetClassPageRequest };

export const getClassPage = async (
  params: GetClassPageRequest
): Promise<ClassPageResponse> => {
  const response = await api.get(classEndpoints.page, {
    params,
  });
  return response.data;
};
