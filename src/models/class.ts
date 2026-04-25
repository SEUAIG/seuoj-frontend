import type { ApiResponse, ApiResponseBase, PageData } from "@/models/common";

export interface IntroAttachmentInput {
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface ClassIntroAttachment {
  id: number;
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface ClassItem {
  class_id: number;
  name: string;
  description: string;
  is_public: boolean;
  can_write?: boolean;
}

export interface GetClassPageRequest {
  current?: number;
  size?: number;
}

export type ClassPageResponse = ApiResponse<PageData<ClassItem>>;

export interface CreateClassRequest {
  name: string;
  description?: string;
  is_public: boolean;
}

export type CreateClassResponse = ApiResponse<{ class_id: number }>;

export type DeleteClassResponse = ApiResponseBase;
export type JoinClassResponse = ApiResponseBase;

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
  introduction?: string;
  add_intro_attachments?: IntroAttachmentInput[];
  remove_intro_attachment_ids?: number[];
}

export type UpdateClassResponse = ApiResponseBase;

export interface ClassDetailData {
  class_id: number;
  name: string;
  description: string;
  introduction: string | null;
  intro_attachments: ClassIntroAttachment[];
  creator_id: number;
  is_public: boolean;
  can_write?: boolean;
}

export type ClassDetailResponse = ApiResponse<ClassDetailData>;

export interface ClassMemberItem {
  user_id: number;
  username: string;
  nickname?: string;
  joined_at: string;
}

export interface GetClassMemberPageRequest {
  current?: number;
  size?: number;
}

export type ClassMemberPageResponse = ApiResponse<PageData<ClassMemberItem>>;

export type AddMemberResponse = ApiResponseBase;
export type RemoveMemberResponse = ApiResponseBase;

export interface AssignmentProgressItem {
  assignment_id: number;
  title: string;
  status: string;
  deadline: string | null;
  problem_count: number;
  avg_completion_rate: number;
}

export interface StudentOverviewItem {
  user_id: number;
  username: string;
  nickname?: string;
  ac_count: number;
  submit_count: number;
}

export interface ClassOverviewData {
  member_count: number;
  total_problems: number;
  assignments: AssignmentProgressItem[];
  students: StudentOverviewItem[];
}

export type ClassOverviewResponse = ApiResponse<ClassOverviewData>;

export interface AttachmentItem {
  id: number;
  file_path: string;
  file_name: string;
  file_size: number;
}

export interface AnnouncementItem {
  announcement_id: number;
  title: string;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  created_by_user_id: number;
  created_by_username: string;
  created_by_nickname?: string;
  attachments: AttachmentItem[];
}

export interface PaginationQuery {
  current?: number;
  size?: number;
}

export type AnnouncementPageResponse = ApiResponse<PageData<AnnouncementItem>>;

export interface CreateAnnouncementRequest {
  title: string;
  content?: string;
  is_pinned?: boolean;
  attachments?: IntroAttachmentInput[];
}

export type CreateAnnouncementResponse = ApiResponse<{ announcement_id: number }>;

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  add_attachments?: IntroAttachmentInput[];
  remove_attachment_ids?: number[];
}

export interface ProblemStatItem {
  pid: string;
  title: string;
  weight: number;
  ac_count: number;
  attempt_count: number;
  ac_rate: number;
}

export interface StudentStatItem {
  user_id: number;
  username: string;
  nickname?: string;
  ac_count: number;
  submit_count: number;
  problem_count: number;
  submitted_before_deadline: boolean;
}

export interface AssignmentOverviewData {
  assignment_id: number;
  title: string;
  deadline: string | null;
  member_count: number;
  problem_count: number;
  avg_completion_rate: number;
  problems: ProblemStatItem[];
  students: StudentStatItem[];
}

export type AssignmentOverviewResponse = ApiResponse<AssignmentOverviewData>;

export interface LinkPageItem {
  id: string;
  title: string;
}

export interface GetLinkPageRequest {
  current?: number;
  size?: number;
}

export type LinkPageResponse = ApiResponse<PageData<LinkPageItem>>;

export interface LinkProblemSetPageItem {
  id: string;
  title: string;
}

export interface GetLinkProblemSetPageRequest {
  current?: number;
  size?: number;
}

export type LinkProblemSetPageResponse = ApiResponse<PageData<LinkProblemSetPageItem>>;

export type LinkContestResponse = ApiResponseBase;
export type UnlinkContestResponse = ApiResponseBase;
export type LinkProblemSetResponse = ApiResponseBase;
export type UnlinkProblemSetResponse = ApiResponseBase;

export interface ClassProblemColumn {
  pid: string;
  title: string;
  sort_order: number;
}

export interface ClassMatrixStudentRow {
  username: string;
  nickname?: string;
  user_id: number;
  cells: string[];
  ac_count: number;
}

export interface ClassProblemSetMatrixData {
  problem_set_title: string;
  problems: ClassProblemColumn[];
  students: ClassMatrixStudentRow[];
}

export type ClassProblemSetMatrixResponse = ApiResponse<ClassProblemSetMatrixData>;

export interface ClassBatchStudentRow {
  student_id: string;
  name: string;
  password?: string;
}

export interface ClassBatchImportRequest {
  password_mode: "assigned" | "random";
  send_email: boolean;
  students: ClassBatchStudentRow[];
}

export interface ClassBatchRowResult {
  row: number;
  student_id: string;
  name: string;
  email?: string;
  password?: string;
  status: string;
  detail?: string;
}

export interface ClassBatchImportResult {
  total_count: number;
  success_count: number;
  skipped_count: number;
  fail_count: number;
  rows: ClassBatchRowResult[];
}

export type ClassBatchImportResponse = ApiResponse<ClassBatchImportResult>;
