import type { ApiResponse, ApiResponseBase } from "@/models/common";

export interface ProblemSetListQuery {
  current?: number;
  size?: number;
}

export interface ProblemSetRecord {
  title?: string;
  description?: string;
  is_public?: boolean;
  problem_count?: number;
  problem_set_id?: number;
  can_write?: boolean;
}

export interface ProblemSetPageData {
  current?: number;
  size?: number;
  total?: number;
  records?: ProblemSetRecord[];
}

export type ProblemSetPageResponse = ApiResponse<ProblemSetPageData | undefined>;

export interface ProblemSetProblemItem {
  pid: string;
  title: string;
  sort_order: string;
}

export interface ProblemSetDetailData {
  problem_set_id?: string;
  title?: string;
  description?: string;
  is_public?: boolean;
  problem_list?: ProblemSetProblemItem[];
  can_write?: boolean;
}

export type ProblemSetDetailResponse = ApiResponse<ProblemSetDetailData | undefined>;

export interface ProblemSetProblemPageQuery {
  current?: number;
  size?: number;
}

export interface ProblemSetProblemRecord {
  pid: string;
  title: string;
  sort_order: string;
}

export interface ProblemSetProblemPageData {
  current?: number;
  size?: number;
  total?: number;
  records?: ProblemSetProblemRecord[];
}

export type ProblemSetProblemPageResponse = ApiResponse<ProblemSetProblemPageData | undefined>;

export interface CreateProblemSetRequest {
  title: string;
  discription?: string;
  is_public?: string;
}

export type CreateProblemSetResponse = ApiResponseBase;

export interface UpdateProblemSetProblemItem {
  pid: string;
  title: string;
  order_id: string;
}

export interface UpdateProblemSetRequest {
  title?: string;
  description?: string;
  is_public?: boolean;
  problem_list?: UpdateProblemSetProblemItem[];
}

export type UpdateProblemSetResponse = ApiResponseBase;

export interface ProblemSetProblemEditItem {
  pid: string;
  title: string;
  order_id: string;
}

export interface UpdateProblemSetProblemListRequest {
  problem_list: ProblemSetProblemEditItem[];
}

export type UpdateProblemSetProblemListResponse = ApiResponseBase;
export type DeleteProblemSetResponse = ApiResponse<null>;
