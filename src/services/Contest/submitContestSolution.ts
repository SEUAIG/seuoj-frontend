import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestSubmissionData,
  ContestSubmissionRequest,
  ContestSubmissionResponse,
} from "@/models/contest";

export type {
  ContestSubmissionData,
  ContestSubmissionRequest,
  ContestSubmissionResponse,
};

export const submitContestSolution = async (
  contestId: number,
  payload: ContestSubmissionRequest
): Promise<ContestSubmissionResponse> => {
  const res = await api.post<ContestSubmissionResponse>(
    contestEndpoints.submit(contestId),
    payload
  );
  return res.data;
};
