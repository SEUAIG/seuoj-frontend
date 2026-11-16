import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type { ApiResponse } from "@/models/common";

export interface ContestBalloonItem {
  id: number;
  problemId: number;
  pid: string | null;
  title: string | null;
  color: string;
  status: "PENDING" | "DELIVERED";
  createdAt: string;
  deliveredAt: string | null;
  /** 对应提交已被重测改判或 skip（只出现在已送达的气球上） */
  revoked?: boolean | null;
  username: string | null;
  nickname: string | null;
}

export type ContestBalloonListResponse = ApiResponse<ContestBalloonItem[] | undefined>;

/** 比赛气球队列（含已送达记录）。 */
export const listContestBalloons = async (
  contestId: number
): Promise<ContestBalloonItem[]> => {
  const res = await api.get<ContestBalloonListResponse>(
    contestEndpoints.balloonList(contestId)
  );
  return res.data.data ?? [];
};

/** 志愿者点“送达”。 */
export const deliverContestBalloon = async (
  contestId: number,
  balloonId: number
): Promise<void> => {
  await api.post(contestEndpoints.balloonDeliver(contestId, balloonId));
};

/** 撤回送达：气球回到待送达队列。 */
export const undeliverContestBalloon = async (
  contestId: number,
  balloonId: number
): Promise<void> => {
  await api.post(contestEndpoints.balloonUndeliver(contestId, balloonId));
};

/** 配色面板数据：题目 + 当前生效颜色。 */
export interface ContestBalloonProblem {
  pid: string;
  title: string;
  color: string;
  explicit: boolean;
}

export const listContestBalloonProblems = async (
  contestId: number
): Promise<ContestBalloonProblem[]> => {
  const res = await api.get<ApiResponse<ContestBalloonProblem[] | undefined>>(
    contestEndpoints.balloonProblems(contestId)
  );
  return res.data.data ?? [];
};

/** 设置某道题的气球颜色；color 传 null 恢复自动分配。 */
export const setContestBalloonColor = async (
  contestId: number,
  pid: string,
  color: string | null
): Promise<void> => {
  await api.put(contestEndpoints.balloonColor(contestId), { pid, color });
};
