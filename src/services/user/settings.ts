import { api } from "@/services/api/axios";
import type { ApiResponse } from "@/models/common";
import type { Capability } from "@/lib/capabilities";
import type { UserRole } from "@/features/auth/types";
import type { SendCodeData } from "@/models/auth";

export interface UserSettings {
  id: number; username: string; nickname: string | null; email: string; role: UserRole;
  allowNicknameChange: boolean; assigned: Capability[]; effective: Capability[];
  canManageProfile: boolean; canManagePermissions: boolean; canGrantAdmin: boolean;
}
function data<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.code !== 0) throw new Error(response.data.message || "操作失败");
  return response.data.data;
}
export const getSettings = async (id?: string) => data(await api.get<ApiResponse<UserSettings>>(`/api/user/${id || "me"}/settings`));
export const saveSettings = async (id: number, body: { nickname: string; email?: string; allowNicknameChange?: boolean }) => data(await api.put<ApiResponse<UserSettings>>(`/api/user/${id}/settings`, body));
export const savePermissions = async (id: number, assigned: Capability[]) => data(await api.put<ApiResponse<UserSettings>>(`/api/user/${id}/permissions`, { assigned }));
export const sendEmailCode = async (email: string) => data(await api.post<ApiResponse<SendCodeData>>("/api/user/me/email/code", { email }));
export const changeEmail = async (body: { email: string; password: string; verificationId: string; code: string }) => data(await api.put<ApiResponse<UserSettings>>("/api/user/me/email", body));
export const resetUserPassword = async (id: number) => data(await api.post<ApiResponse<{ password: string }>>(`/api/user/${id}/password/reset`));
