import { api } from "../api/axios";
import { contestEndpoints } from "@/services/endpoints";
import type { ApiResponse, ApiResponseBase } from "@/models/common";
import type { ContestDiscussionData, SaveContestEditorialRequest } from "@/models/contest";

function ok<T extends ApiResponseBase>(body: T): T {
  if (body.code !== 0) throw new Error(body.message || "操作失败");
  return body;
}

export const getContestDiscussion = async (contestId: number) => {
  const res = await api.get<ApiResponse<ContestDiscussionData>>(contestEndpoints.discussion(contestId));
  return ok(res.data).data;
};

export const saveContestEditorial = async (contestId: number, body: SaveContestEditorialRequest) =>
  ok((await api.put<ApiResponse<{ post_id: number }>>(contestEndpoints.editorial(contestId), body)).data);

export const deleteContestEditorial = async (contestId: number) =>
  ok((await api.delete<ApiResponseBase>(contestEndpoints.editorial(contestId))).data);

/**
 * 题解 PDF 带着登录令牌取回来再在新标签页打开：私有比赛的附件不能靠裸链接访问。
 * 先同步开一个空白页，避免异步之后再 window.open 被浏览器当成弹窗拦掉。
 */
export const openEditorialAttachment = async (contestId: number, attachmentId: number) => {
  const tab = window.open("", "_blank");
  try {
    const res = await api.get<Blob>(contestEndpoints.editorialAttachment(contestId, attachmentId), {
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    if (tab) {
      tab.location.href = url;
    } else {
      window.location.href = url;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    tab?.close();
    throw new Error(e instanceof Error && /40[34]/.test(e.message) ? "附件不存在或尚未公开" : "打开附件失败");
  }
};
