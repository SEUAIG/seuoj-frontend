import { api } from "../api/axios";
import { Info, ProblemExample } from "@/components/pages/ProblemDetailPage";

export type ContestProblemContent = {
  pid: string;
  description: string;
  info: Info;
  input: string;
  output: string;
  example: ProblemExample[];
  hint?: string;
};

export type ContestProblemDetailData = {
  pid: string;
  title: string;
  content: ContestProblemContent;
};

export type ContestProblemDetailResponse = {
  code: number;
  message: string;
  data?: ContestProblemDetailData;
};

export const getContestProblemDetail = async (
  contestId: number,
  pid: string
): Promise<ContestProblemDetailData | undefined> => {
  const res = await api.get<ContestProblemDetailResponse>(
    `/api/problem/${pid}`,
    {
      params: { contest_id: contestId },
    }
  );
  return res.data.data;
};
