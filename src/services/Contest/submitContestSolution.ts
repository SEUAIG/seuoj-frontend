import { api } from "../api/axios";

export type ContestSubmissionRequest = {
  pid: string;
  code: string;
  language: string;
};
export type ContestSubmissionData = {
  submission_no: string;
};
export type ContestSubmissionResponse = {
  code: string;
  message: string;
  data?: ContestSubmissionData;
};

export const submitContestSolution = async (
  contest_public_id: string,
  payload: ContestSubmissionRequest
): Promise<ContestSubmissionResponse> => {
  const res = await api.post<ContestSubmissionResponse>(
    `/api/contest/${contest_public_id}/submission`,
    payload
  );
  return res.data;
};
