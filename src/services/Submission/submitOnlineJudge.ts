import { api } from "@/services/api/axios";
import { submissionEndpoints } from "@/services/endpoints";
import type {
  OnlineJudgeRequest,
  OnlineJudgeResponse,
} from "@/models/submission";

export const submitOnlineJudge = async (
  payload: OnlineJudgeRequest
): Promise<OnlineJudgeResponse> => {
  const res = await api.post<OnlineJudgeResponse>(submissionEndpoints.online, payload);
  return res.data;
};
