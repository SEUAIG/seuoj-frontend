import type { ApiResponse, PageData } from "@/models/common";
import type { IntroAttachmentInput } from "@/models/class";
import type { AssignmentProgressItem } from "@/models/class";
import type { SubmissionListItem } from "@/models/submission";

export interface AssignmentProblemItem {
  problem_id: number;
  pid: string;
  title: string;
  sort_order: number;
  weight: number;
}

export interface AssignmentIntroAttachment {
  id: number;
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface AssignmentDetailData {
  assignment_id: number;
  class_id: number;
  title: string;
  description: string | null;
  introduction: string | null;
  intro_attachments: AssignmentIntroAttachment[];
  status: "DRAFT" | "PUBLISHED";
  deadline: string | null;
  visible_from: string | null;
  visible_to: string | null;
  problem_count: number;
  member_count: number;
  avg_completion_rate: number | null;
  can_write?: boolean;
  problems: AssignmentProblemItem[];
}

export type AssignmentDetailResponse = ApiResponse<AssignmentDetailData>;

export interface AssignmentPageItem {
  id: number;
  class_id: number;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED";
  deadline: string | null;
  visible_from: string | null;
  visible_to: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export type AssignmentPageResponse = ApiResponse<PageData<AssignmentPageItem>>;

export type AssignmentProblemsResponse = ApiResponse<AssignmentProblemItem[]>;
export type AssignmentProgressResponse = ApiResponse<AssignmentProgressItem[]>;

export interface AssignmentSubmissionPageRequest {
  current?: number;
  size?: number;
}

export type AssignmentSubmissionPageResponse = ApiResponse<PageData<SubmissionListItem>>;

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  introduction?: string;
  deadline?: string;
  visible_from?: string;
  visible_to?: string;
  problem_ids?: number[];
  intro_attachments?: IntroAttachmentInput[];
}

export type CreateAssignmentResponse = ApiResponse<{ assignment_id: number }>;

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  introduction?: string;
  status?: "DRAFT" | "PUBLISHED";
  deadline?: string;
  visible_from?: string;
  visible_to?: string;
  add_intro_attachments?: IntroAttachmentInput[];
  remove_intro_attachment_ids?: number[];
}

export type UpdateAssignmentResponse = ApiResponse<null>;
export type DeleteAssignmentResponse = ApiResponse<null>;

export interface ImportFromProblemSetRequest {
  problem_set_id: number;
}

export type ImportFromProblemSetResponse = ApiResponse<null>;

export interface AssignmentProblemEditItem {
  problem_id: number;
  weight?: number;
}

export interface ReplaceAssignmentProblemsRequest {
  problems: AssignmentProblemEditItem[];
}

export type ReplaceAssignmentProblemsResponse = ApiResponse<null>;
