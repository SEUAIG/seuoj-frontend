import { api } from "../api/axios";
import { discussionEndpoints } from "@/services/endpoints";
import type { ApiResponse, ApiResponseBase } from "@/models/common";
import type {
  CommentItem,
  CommentRevisions,
  CommentSummary,
  CommentThreadData,
  ThreadTarget,
  VoteResult,
} from "@/models/discussion";

function ok<T extends ApiResponseBase>(body: T): T {
  if (body.code !== 0) throw new Error(body.message || "操作失败");
  return body;
}

export const getCommentThread = async (target: ThreadTarget, sort: "hot" | "new", current: number) => {
  const res = await api.get<ApiResponse<CommentThreadData>>(discussionEndpoints.comments, {
    params: { ...target, sort, current },
  });
  return ok(res.data).data;
};

export const getCommentSubtree = async (id: number, contestId?: number) => {
  const res = await api.get<ApiResponse<CommentThreadData>>(discussionEndpoints.subtree(id), {
    params: contestId ? { contest_id: contestId } : undefined,
  });
  return ok(res.data).data;
};

export const getCommentSummary = async (target: ThreadTarget) => {
  const res = await api.get<ApiResponse<CommentSummary>>(discussionEndpoints.summary, { params: target });
  return ok(res.data).data;
};

export const createComment = async (body: Partial<ThreadTarget> & { parent_id?: number; content: string }) =>
  ok((await api.post<ApiResponse<CommentItem>>(discussionEndpoints.comments, body)).data).data;

export const editComment = async (id: number, content: string) =>
  ok((await api.put<ApiResponse<CommentItem>>(discussionEndpoints.comment(id), { content })).data).data;

export const getCommentRevisions = async (id: number) => {
  const res = await api.get<ApiResponse<CommentRevisions>>(discussionEndpoints.revisions(id));
  return ok(res.data).data;
};

export const deleteComment = async (id: number) =>
  ok((await api.delete<ApiResponseBase>(discussionEndpoints.comment(id))).data);

export const moderateComment = async (id: number, body: { pinned?: boolean; hidden?: boolean; reason?: string }) =>
  ok((await api.put<ApiResponse<CommentItem>>(discussionEndpoints.moderation(id), body)).data).data;

export const voteComment = async (id: number, value: -1 | 0 | 1) =>
  ok((await api.put<ApiResponse<VoteResult>>(discussionEndpoints.votes, { target_type: "COMMENT", target_id: id, value })).data)
    .data;
