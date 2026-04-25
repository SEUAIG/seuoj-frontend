import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { CreateClassRequest, CreateClassResponse } from "@/models/class";

export type { CreateClassRequest, CreateClassResponse };

export const createClass = async (
  data: CreateClassRequest
): Promise<CreateClassResponse> => {
  const response = await api.post(classEndpoints.create, data);
  return response.data;
};
