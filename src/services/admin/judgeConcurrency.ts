import { api } from "@/services/api/axios";
import type { ApiResponse } from "@/models/common";

export interface ProbeSample {
  /** Unix 毫秒 */
  at: number;
  /** 这次运行期间正在评测的提交数 */
  running: number;
  cpuMs: number;
  realMs: number;
}

export interface JudgeStatus {
  limit: number;
  defaultLimit: number;
  maxLimit: number;
  running: number;
  waiting: number;
  probe: { intervalSeconds: number; error: string | null; samples: ProbeSample[] | null } | null;
}

export interface JudgeConcurrencyStatus {
  /** 保存的设置，null 表示沿用判题端默认值 */
  configured: number | null;
  maxLimit: number;
  canEdit: boolean;
  rejudgeQueue: number;
  rejudgeMaxInFlight: number;
  /** 连不上判题端时为 null */
  judge: JudgeStatus | null;
  judgeError: string | null;
}

function data<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.code !== 0) throw new Error(response.data.message || "操作失败");
  return response.data.data;
}

export const getJudgeConcurrency = async () =>
  data(await api.get<ApiResponse<JudgeConcurrencyStatus>>("/api/admin/judge/concurrency"));

export const setJudgeConcurrency = async (limit: number) =>
  data(await api.put<ApiResponse<JudgeConcurrencyStatus>>("/api/admin/judge/concurrency", { limit }));
