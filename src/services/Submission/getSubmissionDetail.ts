import { api } from "@/services/api/axios";
import { submissionEndpoints } from "@/services/endpoints";
import type { SubmissionDetailResponse } from "@/models/submission";

export const getSubmissionDetail = async (
  submissionNo: string
): Promise<SubmissionDetailResponse> => {
  const res = await api.get<SubmissionDetailResponse>(submissionEndpoints.byNo(submissionNo));
  return res.data;
};
