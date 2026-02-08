import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/axios";

export interface SubmissionListRecord {
  submission_no: string;
  pid: string;
  language: string;
  status: string;
  verdict: string | null;
  submit_time: string;
  finish_time: string | null;
  username: string;
}

export interface SubmissionListData {
  current: number;
  size: number;
  total: number;
  records: SubmissionListRecord[];
}

interface SubmissionListResponse {
  code: number;
  message: string;
  data: SubmissionListData;
}

export default function useQueryToGetSubmission(
  current: string | number,
  size: string | number,
  enabled: boolean
) {
  return useQuery<SubmissionListData>({
    queryKey: ["submissionList", current, size],
    queryFn: async () => {
      const res = await api.get<SubmissionListResponse>("/api/submission/page", {
        params: { current, size },
      });
      const result = res.data;
      if (result.code !== 0 && result.code !== 200) {
        throw new Error(result.message || "加载提交记录失败");
      }
      return result.data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}
