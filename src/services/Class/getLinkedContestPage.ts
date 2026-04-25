import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  GetLinkPageRequest,
  LinkPageItem,
  LinkPageResponse,
} from "@/models/class";

export type { GetLinkPageRequest, LinkPageItem, LinkPageResponse };

export const getLinkedContestPage = async (
  classId: number,
  params: GetLinkPageRequest
): Promise<LinkPageResponse> => {
  const response = await api.get(classEndpoints.linkedContestPage(classId), {
    params,
  });
  return response.data;
};
