import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  GetLinkProblemSetPageRequest,
  LinkProblemSetPageItem,
  LinkProblemSetPageResponse,
} from "@/models/class";

export type {
  GetLinkProblemSetPageRequest,
  LinkProblemSetPageItem,
  LinkProblemSetPageResponse,
};

export const getLinkedProblemSetPage = async (
  classId: number,
  params: GetLinkProblemSetPageRequest
): Promise<LinkProblemSetPageResponse> => {
  const response = await api.get(classEndpoints.linkedProblemSetPage(classId), {
    params,
  });
  return response.data;
};
