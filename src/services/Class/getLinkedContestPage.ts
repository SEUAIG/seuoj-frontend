import { api } from "../api/axios";

export interface LinkPageItem {
  id: string;
  title: string;
}

export interface LinkPageResponse {
  code: number;
  message: string;
  data: {
    current: number;
    size: number;
    total: number;
    records: LinkPageItem[];
  };
}

export interface GetLinkPageRequest {
  current?: number;
  size?: number;
}

export const getLinkedContestPage = async (
  classId: number,
  params: GetLinkPageRequest
): Promise<LinkPageResponse> => {
  const response = await api.get(
    `/api/class/${classId}/contest/page`,
    {
      params,
    }
  );
  return response.data;
};
