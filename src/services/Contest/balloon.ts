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

/** 设置某道题的气球颜色；color 传 null 恢复自动分配。 */
export const setContestBalloonColor = async (
  contestId: number,
  pid: string,
  color: string | null
): Promise<void> => {
  await api.put(contestEndpoints.balloonColor(contestId), { pid, color });
};
