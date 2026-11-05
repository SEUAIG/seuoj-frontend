import { api } from "@/services/api/axios";
import type { ApiResponse } from "@/models/common";
import { userEndpoints } from "@/services/endpoints";

export interface BanTargets {
  userIds?: number[];
  usernames?: string[];
}

export interface BanOutcome {
  count: number;
  accounts: { id: number; username: string; nickname: string | null }[];
}

function data<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.code !== 0) throw new Error(response.data.message || "操作失败");
  return response.data.data;
}

/** until 为本地时间 "YYYY-MM-DDTHH:mm:ss"，null 表示永久。任一账号不合格则整批不生效。 */
export const banUsers = async (body: BanTargets & { reason: string; until: string | null }) =>
  data(await api.post<ApiResponse<BanOutcome>>(userEndpoints.adminBan, body));

export const unbanUsers = async (body: BanTargets) =>
  data(await api.post<ApiResponse<BanOutcome>>(userEndpoints.adminUnban, body));
