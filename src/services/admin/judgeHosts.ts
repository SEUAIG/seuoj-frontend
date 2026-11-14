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

export interface HostJudging {
  submissionId: string;
  startedAt: number;
  finishedAt?: number | null;
}

export interface JudgeHost {
  id: number;
  name: string;
  core: number | null;
  enabled: boolean;
  /** 已删除，等手上这份评完就消失 */
  removing: boolean;
  current: HostJudging | null;
  last: HostJudging | null;
  /** 判题端本次启动以来评过的份数 */
  judged: number;
  /** 5 分钟 / 15 分钟 / 1 小时 / 5 小时忙碌比例 */
  load: number[];
}

export interface JudgeHostsData {
  hosts: JudgeHost[];
  waiting: number;
  maxHosts: number;
  defaultHosts: number;
  probe: { intervalSeconds: number; error: string | null; samples: ProbeSample[] | null } | null;
}

export interface JudgeHostsStatus {
  maxHosts: number;
  canEdit: boolean;
  rejudgeQueue: number;
  rejudgeMaxInFlight: number;
  /** 连不上判题端时为 null */
  judge: JudgeHostsData | null;
  judgeError: string | null;
}

export interface HostJudgingRecord {
  submissionNo: string;
  contestId: number | null;
  pid: string | null;
  problemTitle: string | null;
  username: string | null;
  status: string;
  verdict: string | null;
  score: number | null;
  judgeStartedAt: string | null;
  judgeMs: number | null;
}

export interface RejudgeOutcome {
  queued: number;
  busy: number;
  queueLength: number;
}

function data<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.code !== 0) throw new Error(response.data.message || "操作失败");
  return response.data.data;
}

const BASE = "/api/admin/judge/hosts";

export const getJudgeHosts = async () => data(await api.get<ApiResponse<JudgeHostsStatus>>(BASE));

export const addJudgeHost = async () => data(await api.post<ApiResponse<JudgeHostsStatus>>(BASE));

export const removeJudgeHost = async (id: number) =>
  data(await api.delete<ApiResponse<JudgeHostsStatus>>(`${BASE}/${id}`));

export const setJudgeHostEnabled = async (id: number, enabled: boolean) =>
  data(await api.put<ApiResponse<JudgeHostsStatus>>(`${BASE}/${id}/enabled`, { enabled }));

export const setAllJudgeHostsEnabled = async (enabled: boolean) =>
  data(await api.put<ApiResponse<JudgeHostsStatus>>(`${BASE}/enabled`, { enabled }));

export const getJudgeHostJudgings = async (id: number) =>
  data(await api.get<ApiResponse<HostJudgingRecord[]>>(`${BASE}/${id}/judgings`));

/** hours 为 null 表示不限时间 */
export const rejudgeJudgeHost = async (id: number, hours: number | null) =>
  data(await api.post<ApiResponse<RejudgeOutcome>>(`${BASE}/${id}/rejudge`, hours == null ? {} : { hours }));
