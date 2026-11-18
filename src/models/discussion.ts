/** 讨论 thread：题目讨论、整场比赛讨论 */
export type CommentTargetType = "PROBLEM" | "CONTEST" | "POST";

/** 定位一个 thread：题目用 pid（从比赛进来再带 contest_id），整场讨论用 contest_id，题解评论区用 post_id */
export interface ThreadTarget {
  target_type: CommentTargetType;
  pid?: string;
  contest_id?: number;
  post_id?: number;
}

export interface CommentAuthor {
  id: number;
  username: string;
  nickname?: string | null;
}

export interface CommentItem {
  id: number;
  parent_id: number | null;
  root_id: number;
  depth: number;
  /** 已删除、或对你隐藏时为 null */
  author: CommentAuthor | null;
  content: string | null;
  deleted: boolean;
  hidden: boolean;
  /** 只有作者和管理者拿得到 */
  hidden_reason?: string | null;
  score: number;
  my_vote: -1 | 0 | 1;
  reply_count: number;
  pinned: boolean;
  mine: boolean;
  can_delete: boolean;
  created_at: string;
  /** 最后一次修改时间，没改过为 null */
  edited_at?: string | null;
  /** 当前是第几版，没改过是 1 */
  revision: number;
}

export interface CommentRevisions {
  comment_id: number;
  /** 从第 1 版到当前版 */
  versions: { version: number; content: string; started_at: string; current: boolean }[];
}

export interface CommentThreadData {
  target_type: CommentTargetType;
  pid?: string | null;
  problem_title?: string | null;
  contest_id?: number | null;
  /** 题解评论区：题解 id 和标题 */
  post_id?: number | null;
  post_title?: string | null;
  can_post: boolean;
  can_manage: boolean;
  sort: "hot" | "new";
  current: number;
  size: number;
  /** 顶层发言总数 */
  total: number;
  /** 子树页的根 */
  focus_id?: number | null;
  pinned: CommentItem[];
  /** 扁平列表，按 parent_id 拼树 */
  comments: CommentItem[];
}

export interface CommentSummary {
  can_view: boolean;
  comment_count: number;
  /** 公开的用户题解数 */
  solution_count: number;
}

export interface VoteResult {
  score: number;
  my_vote: -1 | 0 | 1;
}
