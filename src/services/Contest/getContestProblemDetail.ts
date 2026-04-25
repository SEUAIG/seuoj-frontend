import { api } from "../api/axios";
import { problemEndpoints } from "@/services/endpoints";
import type {
  ContestProblemDetailData,
  ContestProblemDetailResponse,
} from "@/models/contest";

export type ContestProblemContent = ContestProblemDetailData["content"];
export type { ContestProblemDetailData, ContestProblemDetailResponse };

export const getContestProblemDetail = async (
  contestId: number,
  pid: string
): Promise<ContestProblemDetailData | undefined> => {
  const res = await api.get<ContestProblemDetailResponse>(problemEndpoints.byPid(pid), {
    params: { contest_id: contestId },
  });
  return res.data.data;
};
