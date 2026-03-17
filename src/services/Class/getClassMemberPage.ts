import { api } from "../api/axios";

export interface ClassMemberItem {
  user_public_id: string;
  username: string;
  joined_at: string;
}

export interface ClassMemberPageResponse {
  code: number;
  message: string;
  data: {
    current: number;
    size: number;
    total: number;
    records: ClassMemberItem[];
  };
}

export interface GetClassMemberPageRequest {
  current?: number;
  size?: number;
}

export const getClassMemberPage = async (
  class_public_id: string,
  params: GetClassMemberPageRequest
): Promise<ClassMemberPageResponse> => {
  const response = await api.get(`/api/class/${class_public_id}/member/page`, {
    params,
  });
  return response.data;
};
