import { isAxiosError } from "axios";
import { api } from "./api/axios";
import { problemEndpoints } from "@/services/endpoints";

export const TESTCASE_UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;
export const MAX_TESTCASE_ARCHIVE_BYTES = 200 * 1024 * 1024;
export const TESTCASE_ARCHIVE_TOO_LARGE = "压缩包大小不得超过 200 MiB。请减小文件后重试。";

export interface TestcaseUploadProgress {
  loaded: number;
  total?: number;
  percent?: number;
  stage: "uploading" | "processing";
}

export function getTestcaseUploadError(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "上传等待已超过 10 分钟，结果尚未确认。请先刷新文件树检查，再决定是否重试。";
    }
    if (!error.response) {
      return "网络连接中断，上传结果尚未确认。请检查网络，并刷新文件树后再决定是否重试。";
    }
    if (error.response.status === 413) return TESTCASE_ARCHIVE_TOO_LARGE;
    if (error.response.status === 401) return "登录已失效，请重新登录后上传。";
    if (error.response.status === 403) return "没有上传该题测试数据的权限，请联系题目管理员。";
    if ([502, 503, 504].includes(error.response.status)) {
      return "服务器暂时无法完成上传。请稍后刷新文件树确认结果，再决定是否重试。";
    }
    const message = error.response.data?.message;
    if (typeof message === "string" && /[\u3400-\u9fff]/.test(message)) return message;
  } else if (error instanceof Error && /[\u3400-\u9fff]/.test(error.message)) {
    return error.message;
  }
  return "测试数据上传失败，请检查压缩包格式及网络连接后重试。";
}

export async function updateProblem(payload: unknown) {
  const res = await api.patch(problemEndpoints.edit, payload);
  return res.data;
}

export async function uploadProblemTestcases(
  pid: string,
  file: File,
  format: string,
  onProgress?: (progress: TestcaseUploadProgress) => void,
) {
  if (file.size > MAX_TESTCASE_ARCHIVE_BYTES) throw new Error(TESTCASE_ARCHIVE_TOO_LARGE);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);
  let active = true;
  try {
    const res = await api.post(problemEndpoints.data(pid), formData, {
      timeout: TESTCASE_UPLOAD_TIMEOUT_MS,
      onUploadProgress: (event) => {
        if (!active) return;
        const total = event.total && event.total > 0 ? event.total : undefined;
        onProgress?.({
          loaded: event.loaded,
          total,
          percent: total ? Math.min(100, Math.floor(event.loaded / total * 100)) : undefined,
          stage: total && event.loaded >= total ? "processing" : "uploading",
        });
      },
    });
    const result = res.data;
    if (result?.code !== undefined && result.code !== 0 && result.code !== 200) {
      throw new Error(result.message || "测试数据上传失败，请检查压缩包后重试。");
    }
    return result;
  } catch (error) {
    throw new Error(getTestcaseUploadError(error));
  } finally {
    active = false;
  }
}
