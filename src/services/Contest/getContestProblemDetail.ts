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
  contest_public_id: string,
  pid: string
): Promise<ContestProblemDetailData | undefined> => {
  const res = await api.get<ContestProblemDetailResponse>(
    `/api/contest/${contest_public_id}/problem/${pid}`
  );
  return res.data.data;
};
