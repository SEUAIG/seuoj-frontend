import { submissionEndpoints } from "@/services/endpoints";
import { api } from "../api/axios";
import type {
  SubmissionListItem,
  SubmissionPageRequest,
  SubmissionPageResponse,
} from "@/models/submission";

export type { SubmissionListItem, SubmissionPageRequest, SubmissionPageResponse };

export const getSubmissionPage = async (
  params: SubmissionPageRequest
): Promise<SubmissionPageResponse> => {
  const response = await api.get(submissionEndpoints.page, {
    params,
  });
  return response.data;
};
