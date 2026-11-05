import { api } from "@/services/api/axios";
import type { ApiResponse } from "@/models/common";

export interface SkipOutcome {
  /** 命中的提交数 */
  matched: number;
  /** 状态真正发生变化的提交数（已经是目标状态的不算） */
  changed: number;
}

function data<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.code !== 0) throw new Error(response.data.message || "操作失败");
  return response.data.data;
}

/** 任意提交：比赛提交需要比赛管理权限，其余需要题目或作业所在班级的管理权限。整批生效或整批不生效。 */
export const skipSubmissions = async (body: { submissionNos: string[]; skipped: boolean; reason?: string }) =>
  data(await api.post<ApiResponse<SkipOutcome>>("/api/submission/skip", body));

/** 比赛内：按提交编号，或按账号名处理该选手本场全部提交 */
export const skipContestSubmissions = async (
  contestId: number,
  body: { submissionNos?: string[]; username?: string; skipped: boolean; reason?: string }
) => data(await api.post<ApiResponse<SkipOutcome>>(`/api/contest/${contestId}/submission/skip`, body));
