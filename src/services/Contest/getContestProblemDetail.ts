import { api } from "../api/axios";

export type ContestProblemType = "Standard" | "Interactive";
export type ContestCheckerType = "Standard" | "Special";
export type ContestProblemDetailInfo = {
  max_cpu_time_ms: number;
  max_real_time_ms: number;
  max_memory_byte: number;
  max_stack_byte: number;
  max_process_number: number;
  max_output_size: number;
  test_case_number: number;
  problem_type: ContestProblemType;
  checker_type: ContestCheckerType;
};
export type ContestProblemDetailExample = {
  in?: string;
  ans?: string;
  description?: string;
};
export type ContestProblemDetailContent = {
  pid: string;
  description: string;
  info: ContestProblemDetailInfo;
  input: string;
  output: string;
  example: ContestProblemDetailExample[];
};
export type ContestProblemDetailData = {
  pid: string;
  title: string;
  content: ContestProblemDetailContent;
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
