import { api } from "@/services/api/axios";
import { userEndpoints } from "@/services/endpoints";
import type {
  CommonUserRole,
  GetUserPageRequest,
  GetUserPageResponse,
  UserPageData,
  UserPageRecord,
} from "@/models/user";

export type {
  CommonUserRole,
  GetUserPageRequest,
  GetUserPageResponse,
  UserPageData,
  UserPageRecord,
};

export const getUserPage = async (
  params: GetUserPageRequest
): Promise<GetUserPageResponse> => {
  const response = await api.get<GetUserPageResponse>(userEndpoints.page, {
    params,
  });
  return response.data;
};
