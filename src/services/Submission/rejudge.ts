import { api } from "@/services/api/axios";
import type { ApiResponse } from "@/models/common";

export interface RejudgeOutcome {
  /** 已重置并排队的条数 */
  queued: number;
  /** 正在评测、这次没有重测的条数 */
  busy: number;
  /** 当前重测队列长度（含本次） */
  queueLength: number;
}

function data<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.code !== 0) throw new Error(response.data.message || "操作失败");
  return response.data.data;
}

/** 勾选的提交（权限同 skip） */
export const rejudgeSubmissions = async (submissionNos: string[]) =>
  data(await api.post<ApiResponse<RejudgeOutcome>>("/api/submission/rejudge", { submissionNos }));

/** 比赛内：勾选的提交，或给 pid 重测本场该题全部提交 */
export const rejudgeInContest = async (contestId: number, body: { submissionNos?: string[]; pid?: string }) =>
  data(await api.post<ApiResponse<RejudgeOutcome>>(`/api/contest/${contestId}/rejudge`, body));

/** 题库整题：只重测不属于任何比赛的提交 */
export const rejudgeProblem = async (pid: string) =>
  data(await api.post<ApiResponse<RejudgeOutcome>>(`/api/problem/${encodeURIComponent(pid)}/rejudge`));
