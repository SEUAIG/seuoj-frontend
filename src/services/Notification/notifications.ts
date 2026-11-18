import { api } from "../api/axios";
import { notificationEndpoints } from "@/services/endpoints";
import type { ApiResponse, ApiResponseBase } from "@/models/common";
import type { PendingNotifications } from "@/models/notification";

function ok<T extends ApiResponseBase>(body: T): T {
  if (body.code !== 0) throw new Error(body.message || "操作失败");
  return body;
}

export const getPendingNotifications = async () => {
  const res = await api.get<ApiResponse<PendingNotifications>>(notificationEndpoints.pending);
  return ok(res.data).data;
};

/** 标成弹过；返回这次真正抢到的 ID（另一个窗口先弹了的不在里面） */
export const claimNotifications = async (ids: number[]) => {
  const res = await api.post<ApiResponse<{ claimed: number[] }>>(notificationEndpoints.claim, { ids });
  return ok(res.data).data.claimed;
};
