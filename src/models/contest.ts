import type { ApiResponse, ApiResponseBase } from "@/models/common";
import type { ProblemContent } from "@/models/problem";

export type ContestRuleType = "NOI" | "IOI" | "ACM";
export type ContestStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";

export interface ContestProblemOverview {
  sort_order: number;
  pid: string;
  title: string;
}

export interface ContestListQuery {
  current?: number;
  size?: number;
  status?: ContestStatus;
  title?: string;
  rule_type?: ContestRuleType;
}

export interface ContestRecord {
  contest_id: number;
  title?: string;
  subtitle?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status?: ContestStatus;
  rule_type?: ContestRuleType;
  is_public?: boolean;
  can_write?: boolean;
}

export interface ContestPageData {
  total?: number;
  current?: number;
  size?: number;
  records?: ContestRecord[];
}

export type ContestPageResponse = ApiResponse<ContestPageData | undefined>;

export interface CreateContestRequest {
  title: string;
  subtitle?: string;
  description?: string;
  start_time: string;
  end_time: string;
  rule_type: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
}

export type CreateContestResponse = ApiResponse<{ contest_id: number } | undefined>;

export interface ContestDetailData {
  title?: string;
  subtitle?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status?: ContestStatus;
  is_registered?: boolean;
  rule_type?: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
  problem_list: ContestProblemOverview[];
  can_write?: boolean;
}

export type ContestDetailResponse = ApiResponse<ContestDetailData | undefined>;

export interface ContestProblemDetailData {
  pid: string;
  title: string;
  content: ProblemContent;
}

export type ContestProblemDetailResponse = ApiResponse<ContestProblemDetailData | undefined>;

export interface ContestProblemOverviewInEditPage {
  sort_order: number;
  pid: string;
  title: string;
}

export interface ContestProblemListInEditPageData {
  problem_list: ContestProblemOverviewInEditPage[];
}

export type ContestProblemListInEditPageResponse = ApiResponse<
  ContestProblemListInEditPageData | undefined
>;

export interface ContestStandingsQuery {
  current?: number;
  size?: number;
}

export interface ContestStandingsScoreDetail {
  score?: number | null;
  judge_id?: number;
  accepted?: boolean;
  unacceptedCount?: number;
  acceptedTime?: number;
  penaltyTime?: number;
  weighted_score?: number | null;
}

export interface ContestStandingsRecord {
  rank: number;
  username: string;
  nickname?: string;
  score: number;
  penalty?: number;
  score_details: Record<string, ContestStandingsScoreDetail>;
}

export interface ContestStandingsData {
  contest_id: number;
  rule_type: ContestRuleType;
  problems: ContestProblemOverview[];
  records: ContestStandingsRecord[];
}

export type ContestStandingsResponse = ApiResponse<ContestStandingsData | undefined>;

export type ContestSubmissionStatus = "Pending" | "Running" | "Failed" | "Finished";

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

export interface ContestSubmissionResultItem {
  cnt: number;
  time: number;
  mem: number;
  type: ContestSubmissionResultType;
}

export interface ContestSubmissionDetailData {
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
}

export type ContestSubmissionDetailResponse = ApiResponse<ContestSubmissionDetailData | undefined>;

export interface ContestSubmissionPageQuery {
  current?: number;
  size?: number;
}

export interface ContestSubmissionRecord {
  submission_no: string;
  language: string | null;
  status: ContestSubmissionStatus;
  verdict: ContestSubmissionVerdict | null;
  score: number | null;
  submit_time: string;
  username: string;
  nickname?: string;
  user_id?: number;
  problem: ContestProblemOverview;
}

export interface ContestSubmissionPageData {
  current: number;
  size: number;
  total: number;
  records: ContestSubmissionRecord[];
}

export type ContestSubmissionPageResponse = ApiResponse<ContestSubmissionPageData | undefined>;

export interface UpdateContestRequest {
  title?: string;
  subtitle?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  rule_type?: ContestRuleType;
  is_public?: boolean;
  hide_statistics?: boolean;
}

export type UpdateContestResponse = ApiResponseBase;

export interface ContestProblemEditItem {
  pid: string;
  sort_order: number;
}

export interface UpdateContestProblemListRequest {
  problem_list: ContestProblemEditItem[];
}

export type UpdateContestProblemListResponse = ApiResponseBase;

export interface ContestSubmissionRequest {
  pid: string;
  code: string;
  language: string;
}

export interface ContestSubmissionData {
  submission_no: string;
}

export type ContestSubmissionResponse = ApiResponse<ContestSubmissionData | undefined> & {
  code: string;
};

export type DeleteContestResponse = ApiResponse<null>;

export type RegisterContestResponse = ApiResponseBase;

export interface ContestUnregisterQuery {
  contest_id?: number;
}

export type ContestUnregisterResponse = ApiResponseBase;
