import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type { ApiResponse, ApiResponseBase } from "@/models/common";
import type { ContestAnnouncementRequest, ContestNoticesData } from "@/models/contest";

function ok<T extends ApiResponseBase>(body: T): T {
  if (body.code !== 0) throw new Error(body.message || "操作失败");
  return body;
}

export const getContestNotices = async (contestId: number) => {
  const res = await api.get<ApiResponse<ContestNoticesData>>(contestEndpoints.notices(contestId));
  return ok(res.data).data;
};

export const createContestAnnouncement = async (contestId: number, body: ContestAnnouncementRequest) =>
  ok((await api.post<ApiResponseBase>(contestEndpoints.announcement(contestId), body)).data);

export const updateContestAnnouncement = async (
  contestId: number,
  announcementId: number,
  body: ContestAnnouncementRequest
) => ok((await api.put<ApiResponseBase>(contestEndpoints.announcement(contestId, announcementId), body)).data);

export const deleteContestAnnouncement = async (contestId: number, announcementId: number) =>
  ok((await api.delete<ApiResponseBase>(contestEndpoints.announcement(contestId, announcementId))).data);

export const askContestClarification = async (
  contestId: number,
  body: { problem_pid?: string; question: string }
) => ok((await api.post<ApiResponseBase>(contestEndpoints.clarification(contestId), body)).data);

export const answerContestClarification = async (
  contestId: number,
  clarificationId: number,
  body: { answer: string; is_public: boolean }
) =>
  ok(
    (await api.put<ApiResponseBase>(`${contestEndpoints.clarification(contestId, clarificationId)}/answer`, body))
      .data
  );

export const deleteContestClarification = async (contestId: number, clarificationId: number) =>
  ok((await api.delete<ApiResponseBase>(contestEndpoints.clarification(contestId, clarificationId))).data);
