import { api } from "../api/axios";
import { discussionEndpoints } from "@/services/endpoints";
import type { ApiResponse, ApiResponseBase } from "@/models/common";
import type { PostDetail, SolutionPageData, SolutionSaveRequest } from "@/models/post";
import type { VoteResult } from "@/models/discussion";

function ok<T extends ApiResponseBase>(body: T): T {
  if (body.code !== 0) throw new Error(body.message || "操作失败");
  return body;
}

const ctx = (contestId?: number) => (contestId ? { contest_id: contestId } : undefined);

export const getSolutions = async (pid: string, contestId: number | undefined, current: number) => {
  const res = await api.get<ApiResponse<SolutionPageData>>(discussionEndpoints.solutions(pid), {
    params: { ...ctx(contestId), current },
  });
  return ok(res.data).data;
};

export const getPost = async (id: number, contestId?: number) => {
  const res = await api.get<ApiResponse<PostDetail>>(discussionEndpoints.post(id), { params: ctx(contestId) });
  return ok(res.data).data;
};

export const createSolution = async (body: SolutionSaveRequest) =>
  ok((await api.post<ApiResponse<PostDetail>>(discussionEndpoints.posts, body)).data).data;

export const updateSolution = async (id: number, body: SolutionSaveRequest) =>
  ok((await api.put<ApiResponse<PostDetail>>(discussionEndpoints.post(id), body)).data).data;

export const deleteSolution = async (id: number) =>
  ok((await api.delete<ApiResponseBase>(discussionEndpoints.post(id))).data);

export const moderatePost = async (
  id: number,
  body: { featured?: boolean; hidden?: boolean; reason?: string },
  contestId?: number
) =>
  ok((await api.put<ApiResponse<PostDetail>>(discussionEndpoints.postModeration(id), body, { params: ctx(contestId) })).data)
    .data;

export const votePost = async (id: number, value: -1 | 0 | 1) =>
  ok((await api.put<ApiResponse<VoteResult>>(discussionEndpoints.votes, { target_type: "POST", target_id: id, value })).data)
    .data;
