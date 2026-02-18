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
export type ContestSubmissionPageQuery = {
  current?: number;
  size?: number;
};
export type ContestSubmissionRecord = {
  submission_no: string;
  language: string | null;
  status: ContestSubmissionStatus;
  verdict: ContestSubmissionVerdict | null;
  score: number | null;
  submit_time: string;
  username: string;
  problem: ContestProblemOverview;
};
export type ContestSubmissionPageData = {
  current: number;
  size: number;
  total: number;
  records: ContestSubmissionRecord[];
};
export type ContestSubmissionPageResponse = {
  code: number;
  message: string;
  data?: ContestSubmissionPageData;
};

export const getContestSubmissionPage = async (
  contest_public_id: string,
  params: ContestSubmissionPageQuery
): Promise<ContestSubmissionPageData | undefined> => {
  const res = await api.get<ContestSubmissionPageResponse>(
    `/api/contest/${contest_public_id}/submission/page`,
    { params }
  );
  return res.data.data;
};
