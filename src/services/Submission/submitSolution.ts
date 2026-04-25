import { api } from "@/services/api/axios";
import { submissionEndpoints } from "@/services/endpoints";
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
} from "@/models/submission";

export const submitSolution = async (
  payload: CreateSubmissionRequest
): Promise<CreateSubmissionResponse> => {
  const res = await api.post<CreateSubmissionResponse>(submissionEndpoints.create, payload);
  return res.data;
};
