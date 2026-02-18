import { api } from "../api/axios";

export type ContestProblemOverview = {
  sort_order: number;
  pid: string;
  title: string;
};
export type ContestSubmissionStatus =
  | "Pending"
  | "Running"
  | "Failed"
  | "Finished";
export type ContestSubmissionVerdict =
  | "CompileError"
  | "JudgeError"
  | "Accepted"
  | "WrongAnswer"
  | "TimeLimitExceeded"
  | "MemoryLimitExceeded"
  | "RuntimeError"
  | "SystemError";
export type ContestSubmissionResultType =
  | "Accepted"
  | "WrongAnswer"
  | "TimeLimitExceeded"
  | "MemoryLimitExceeded"
  | "RuntimeError"
  | "SystemError";
export type ContestSubmissionResultItem = {
  cnt: number;
  time: number;
  mem: number;
  type: ContestSubmissionResultType;
};
export type ContestSubmissionDetailData = {
  submission_no: string;
  language: string | null;
  status: ContestSubmissionStatus;
  verdict: ContestSubmissionVerdict | null;
  score: number | null;
  result_detail: ContestSubmissionResultItem[] | null;
  error_detail: string | null;
  submit_time: string;
  code: string | null;
  username: string;
  problem: ContestProblemOverview;
};
export type ContestSubmissionDetailResponse = {
  code: number;
  message: string;
  data?: ContestSubmissionDetailData;
};

export const getContestSubmissionDetail = async (
  contest_public_id: string,
  submission_no: string
): Promise<ContestSubmissionDetailData | undefined> => {
  const res = await api.get<ContestSubmissionDetailResponse>(
    `/api/contest/${contest_public_id}/submission/${submission_no}`
  );
  return res.data.data;
};
