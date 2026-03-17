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
  class_public_id: string,
  params: GetLinkPageRequest
): Promise<LinkPageResponse> => {
  const response = await api.get(
    `/api/class/${class_public_id}/contest/page`,
    {
      params,
    }
  );
  return response.data;
};
