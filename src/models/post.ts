import type { CommentAuthor } from "@/models/discussion";

/** 用户题解（post.kind = SOLUTION） */
export type PostStatus = "DRAFT" | "PUBLISHED";

export interface SolutionItem {
  id: number;
  title: string;
  author: CommentAuthor | null;
  score: number;
  comment_count: number;
  featured: boolean;
  status: PostStatus;
  hidden: boolean;
  mine: boolean;
  published_at?: string | null;
  updated_at?: string | null;
}

export interface SolutionPageData {
  pid: string;
  problem_title: string;
  /** 现在能不能写：登录、AC 过、这道题还没写过 */
  can_post: boolean;
  has_accepted: boolean;
  can_manage: boolean;
  my_count: number;
  /** 我在这道题下的题解（含草稿），写过就去改它 */
  my_post_id?: number | null;
  max_per_problem: number;
  current: number;
  size: number;
  total: number;
  /** 第 1 页：我自己的草稿、被隐藏的 */
  mine_pending: SolutionItem[];
  items: SolutionItem[];
}

export interface PostDetail {
  id: number;
  kind: "SOLUTION";
  title: string;
  content: string;
  author: CommentAuthor | null;
  status: PostStatus;
  featured: boolean;
  hidden: boolean;
  hidden_reason?: string | null;
  score: number;
  my_vote: -1 | 0 | 1;
  comment_count: number;
  allow_comment: boolean;
  mine: boolean;
  can_manage: boolean;
  pid: string;
  problem_title: string;
  contest_id?: number | null;
  published_at?: string | null;
  updated_at?: string | null;
}

export interface SolutionSaveRequest {
  pid?: string;
  contest_id?: number;
  title: string;
  content: string;
  status: PostStatus;
}
