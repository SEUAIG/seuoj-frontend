import type { ApiResponse, ApiResponseBase } from "@/models/common";

export interface ProblemExample {
  in: string;
  ans: string;
  description: string;
}

export interface ProblemInfo {
  max_cpu_time_ms: string | number;
  max_real_time_ms: string | number;
  max_memory_byte?: string | number;
  max_memory_kb?: string | number;
  max_stack_byte?: string | number;
  max_process_number?: string | number;
  max_output_size?: string | number;
  min_cpu_time_ms?: string | number;
  min_memory_kb?: string | number;
  min_memory_byte?: string | number;
  test_case_number?: string | number;
  problem_type?: string;
  checker_type?: string;
}

export interface ProblemContent {
  pid: string;
  description: string;
  info: ProblemInfo;
  input: string;
  output: string;
  example: ProblemExample[];
  hint?: string;
}

export interface ProblemData {
  pid: string;
  title: string;
  content: ProblemContent;
  tags: string[];
  totalSubmit: number;
  totalAccept: number;
  submittable?: boolean;
  is_public?: boolean;
  can_write?: boolean;
}

export interface ProblemDetailQuery {
  contest_id?: string;
  problem_set_id?: string;
  assignment_id?: string;
}

export type ProblemDetailResponse = ApiResponse<ProblemData>;

export interface NextProblemIdData {
  next_pid: string;
}

export type NextProblemIdResponse = ApiResponse<NextProblemIdData>;

export interface ProblemFileTreeData {
  tree: Array<{ name: string; children?: unknown[] }>;
}

export type ProblemFileTreeResponse = ApiResponse<ProblemFileTreeData | unknown>;

export interface ScoreDistributionItem {
  range: string;
  count: number;
}

export interface SubmissionTrendItem {
  date: string;
  count: number;
}

export interface ProblemStatisticsData {
  totalSubmit: number;
  totalAccept: number;
  acceptRate: number;
  scoreDistribution: ScoreDistributionItem[];
  submissionTrend: SubmissionTrendItem[];
}

export type ProblemStatisticsResponse = ApiResponse<ProblemStatisticsData>;

export type DeleteProblemResponse = ApiResponseBase;
