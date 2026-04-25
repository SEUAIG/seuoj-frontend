import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestProblemOverview,
  ContestSubmissionDetailData,
  ContestSubmissionDetailResponse,
  ContestSubmissionResultItem,
  ContestSubmissionResultType,
  ContestSubmissionStatus,
  ContestSubmissionVerdict,
} from "@/models/contest";

export type {
  ContestProblemOverview,
  ContestSubmissionDetailData,
  ContestSubmissionDetailResponse,
  ContestSubmissionResultItem,
  ContestSubmissionResultType,
  ContestSubmissionStatus,
  ContestSubmissionVerdict,
};

export const getContestSubmissionDetail = async (
  contestId: number,
  submission_no: string
): Promise<ContestSubmissionDetailData | undefined> => {
  const res = await api.get<ContestSubmissionDetailResponse>(
    contestEndpoints.submissionById(contestId, submission_no)
  );
  return res.data.data;
};
