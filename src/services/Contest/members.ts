import { api } from "../api/axios";
import type { ApiResponse } from "@/models/common";

export interface ParticipantInput {
  id?: number; user_id?: number; username?: string; display_name: string; is_starred?: boolean;
  student_no?: string; college?: string; class_name?: string; contact_email?: string; notes?: string;
}
export interface ContestParticipant extends Omit<ParticipantInput, "id" | "username" | "user_id"> {
  id: number; user_id: number | null; username: string | null; nickname: string | null;
  is_managed: boolean; account_status: "UNGENERATED" | "GENERATED" | "LINKED" | "DISABLED"; can_manage_account: boolean;
}
export interface ContestMembers {
  creator_user_id: number;
  administrators: { user_id: number; username: string; nickname: string | null }[];
  participants: ContestParticipant[];
}
export interface AccountOption { user_id: number; username: string; nickname: string | null; is_enabled: boolean }
export interface GenerateInput { ids: number[]; prefix: string; start: number; digits: number }
export interface AccountPlan { id: number; display_name: string; username: string; error: string | null }
export interface Credential { id: number; display_name: string; username: string; password: string }
const endpoint = (id: number) => `/api/contest/${id}/members`;
function unwrap<T>(response: ApiResponse<T>): T {
  if (response.code !== 0) throw new Error(response.message || "操作失败");
  return response.data;
}
export async function getContestMembers(id: number) { return unwrap((await api.get<ApiResponse<ContestMembers>>(endpoint(id))).data); }
export async function addContestAdministrator(id: number, account: AccountOption) { unwrap((await api.post(`${endpoint(id)}/administrators`, { user_id: account.user_id })).data); }
export async function removeContestAdministrator(id: number, userId: number) { unwrap((await api.delete(`${endpoint(id)}/administrators/${userId}`)).data); }
export async function saveContestParticipants(id: number, participants: ParticipantInput[]) {
  return unwrap((await api.put<ApiResponse<number>>(`${endpoint(id)}/participants`, { participants }, { timeout: 60000 })).data);
}
export async function participantAction(id: number, ids: number[], action: "star" | "unstar" | "remove") {
  unwrap((await api.post(`${endpoint(id)}/participants/actions`, { ids, action })).data);
}
export async function previewAccounts(id: number, input: GenerateInput) { return unwrap((await api.post<ApiResponse<AccountPlan[]>>(`${endpoint(id)}/accounts/preview`, input)).data); }
export async function generateAccounts(id: number, input: GenerateInput) { return unwrap((await api.post<ApiResponse<Credential[]>>(`${endpoint(id)}/accounts/generate`, input, { timeout: 120000 })).data); }
export async function resetAccounts(id: number, ids: number[]) { return unwrap((await api.post<ApiResponse<Credential[]>>(`${endpoint(id)}/accounts/reset`, { ids }, { timeout: 120000 })).data); }
export async function setAccountsEnabled(id: number, ids: number[], enabled: boolean) { unwrap((await api.put(`${endpoint(id)}/accounts/status`, { ids, enabled })).data); }

export async function searchContestAccounts(id: number, q: string, signal?: AbortSignal) {
  return unwrap((await api.get<ApiResponse<AccountOption[]>>(`${endpoint(id)}/accounts/search`, { params: { q }, signal })).data);
}
