import { api } from "../api/axios";

export interface LinkProblemSetPageItem {
  id: string;
  title: string;
}

export interface LinkProblemSetPageResponse {
  code: number;
  message: string;
  data: {
    current: number;
    size: number;
    total: number;
    records: LinkProblemSetPageItem[];
  };
}

export interface GetLinkProblemSetPageRequest {
  current?: number;
  size?: number;
}

export const getLinkedProblemSetPage = async (
  class_public_id: string,
  params: GetLinkProblemSetPageRequest
): Promise<LinkProblemSetPageResponse> => {
  const response = await api.get(
    `/api/class/${class_public_id}/problem_set/page`,
    {
      params,
    }
  );
  return response.data;
};
