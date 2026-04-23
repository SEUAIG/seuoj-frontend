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
  classId: number,
  params: GetLinkProblemSetPageRequest
): Promise<LinkProblemSetPageResponse> => {
  const response = await api.get(
    `/api/class/${classId}/problem_set/page`,
    {
      params,
    }
  );
  return response.data;
};
