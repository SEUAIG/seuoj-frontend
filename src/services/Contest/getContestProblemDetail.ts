import { api } from "../api/axios";
import { problemEndpoints } from "@/services/endpoints";
import type {
  ContestProblemDetailData,
  ContestProblemDetailResponse,
} from "@/models/contest";
import axios from "axios";

export type ContestProblemContent = ContestProblemDetailData["content"];
export type { ContestProblemDetailData, ContestProblemDetailResponse };

export const getContestProblemDetail = async (
  contestId: number,
  pid: string
): Promise<ContestProblemDetailData | undefined> => {
  try {
    const res = await api.get<ContestProblemDetailResponse>(problemEndpoints.byPid(pid), {
      params: { contest_id: contestId },
    });
    const code = Number(res.data.code);
    if (code !== 0 || !res.data.data) {
      const err = new Error(res.data.message || "获取题目详情失败") as Error & { code?: number };
      err.code = code;
      throw err;
    }
    return res.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const payload = error.response.data as ContestProblemDetailResponse;
      const code = Number(payload.code);
      const err = new Error(payload.message || "获取题目详情失败") as Error & { code?: number };
      err.code = code;
      throw err;
    }
    throw error;
  }
};
