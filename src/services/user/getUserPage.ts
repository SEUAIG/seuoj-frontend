import { api } from "@/services/api/axios";

export type CommonUserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export interface GetUserPageRequest {
  current?: number;
  size?: number;
  username?: string;
  email?: string;
  roles?: CommonUserRole[];
}

export interface UserPageRecord {
  user_public_id: string;
  username: string;
  email: string;
  roles: CommonUserRole[];
}

export interface UserPageData {
  current: number;
  size: number;
  total: number;
  records: UserPageRecord[];
}

export interface GetUserPageResponse {
  code: number;
  message: string;
  data: UserPageData;
}

export const getUserPage = async (
  params: GetUserPageRequest
): Promise<GetUserPageResponse> => {
  const response = await api.get<GetUserPageResponse>("/api/common/user/page", {
    params,
  });
  return response.data;
};
