import { api } from "../api/axios";

export interface SubmissionPageRequest {
  current?: number;
  size?: number;
}

export interface SubmissionListItem {
  pid: string;
  language: string;
  status: "Pending" | "Running" | "Failed" | "Finished";
  verdict:
    | "CompileError"
    | "JudgeError"
    | "Accepted"
    | "WrongAnswer"
    | "TimeLimitExceeded"
    | "MemoryLimitExceeded"
    | "RuntimeError"
    | "SystemError"
    | "PartiallyAccepted"
    | "Skipped"
    | null;
  username: string;
  submission_no: string;
  submit_time: string;
  finish_time: string | null;
}

export interface SubmissionPageResponse {
  code: number;
  message: string;
  data: {
    total: number;
    size: number;
    current: number;
    records: SubmissionListItem[];
  };
}

export const getSubmissionPage = async (
  params: SubmissionPageRequest
): Promise<SubmissionPageResponse> => {
  const response = await api.get("/api/submission/page", {
    params,
  });
  return response.data;
};
