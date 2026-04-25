import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type {
  ContestProblemOverview,
  ContestSubmissionPageData,
  ContestSubmissionPageQuery,
  ContestSubmissionPageResponse,
  ContestSubmissionRecord,
  ContestSubmissionStatus,
  ContestSubmissionVerdict,
} from "@/models/contest";

export type {
  ContestProblemOverview,
  ContestSubmissionPageData,
  ContestSubmissionPageQuery,
  ContestSubmissionPageResponse,
  ContestSubmissionRecord,
  ContestSubmissionStatus,
  ContestSubmissionVerdict,
};

export const getContestSubmissionPage = async (
  contestId: number,
  params: ContestSubmissionPageQuery
): Promise<ContestSubmissionPageData | undefined> => {
  const res = await api.get<ContestSubmissionPageResponse>(
    contestEndpoints.submissionPage(contestId),
    { params }
  );
  return res.data.data;
};
