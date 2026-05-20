import type { ApiResponse, PageData } from "@/models/common";

export type SubmissionStatus = "Pending" | "Running" | "Failed" | "Finished";

export type SubmissionVerdict =
  | "CompileError"
  | "JudgeError"
  | "Accepted"
  | "WrongAnswer"
  | "TimeLimitExceeded"
  | "MemoryLimitExceeded"
  | "RuntimeError"
  | "SystemError"
  | "PartiallyAccepted"
  | "CodeTooLong"
  | "Skipped"
  | null;

export interface SubmissionPageRequest {
  current?: number;
  size?: number;
  pid?: string;
  verdict?: string;
  language?: string;
  username?: string;
  assignment_id?: number;
}

export interface SubmissionListItem {
  pid: string;
  language: string;
  status: SubmissionStatus;
  verdict: SubmissionVerdict;
  username: string;
  nickname?: string;
  user_id?: number;
  submission_no: string;
  submit_time: string;
  finish_time: string | null;
}

export type SubmissionPageResponse = ApiResponse<PageData<SubmissionListItem>>;

export interface ResultDetailItem {
  id?: number;
  in: string;
  out: string;
  ans: string;
  sys: string;
  time: number;
  mem: number;
  type: string;
  score?: number;
}

export interface SubtaskItem {
  id: number;
  cases: number[];
  pre_subtasks: number[];
  score: number;
  type: "min" | "sum";
}

export interface SubmissionData {
  submissionNo: string;
  pid: string;
  language: string;
  status: SubmissionStatus;
  verdict: SubmissionVerdict;
  resultDetail: ResultDetailItem[] | null;
  errorDetail: string | null;
  submitTime: string;
  finishTime: string;
  message?: string;
  code: string;
  username: string;
  nickname?: string;
  userId?: number;
  score?: number;
  subtasks?: SubtaskItem[];
}

export type SubmissionDetailResponse = ApiResponse<SubmissionData>;

export interface CreateSubmissionRequest {
  pid: string;
  language: string;
  code: string;
  assignment_id?: number;
  problem_set_id?: number;
}

export interface CreateSubmissionData {
  submissionNo?: string;
  submission_no?: string;
}

export type CreateSubmissionResponse = ApiResponse<CreateSubmissionData>;

export interface OnlineJudgeRequest {
  pid: string;
  code: string;
  language: string;
  testcases: Array<{ id: number; in: string }>;
}

export interface OnlineJudgeResultData {
  resultDetail: ResultDetailItem[];
  status: string;
}

export type OnlineJudgeResponse = ApiResponse<OnlineJudgeResultData>;

export interface Language {
  name: string;
  available: boolean;
  version: string | null;
}

export interface LanguagesData {
  languages: Language[];
}

export type LanguagesResponse = ApiResponse<LanguagesData>;
