import { api } from "../api/axios";

export interface ClassMemberItem {
  user_id: number;
  username: string;
  nickname?: string;
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
  classId: number,
  params: GetClassMemberPageRequest
): Promise<ClassMemberPageResponse> => {
  const response = await api.get(`/api/class/${classId}/member/page`, {
    params,
  });
  return response.data;
};
