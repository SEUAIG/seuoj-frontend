import { api } from "./api/axios";
import { problemEndpoints } from "@/services/endpoints";

export async function getTestFile(pid: string) {
  const res = await api.get(problemEndpoints.tree(pid));
  return res.data.data;
}

/**
 * 通过 axios 下载题目文件（携带 JWT）
 * 返回的是 Blob，调用方可用 URL.createObjectURL 触发浏览器下载
 */
export async function downloadProblemFile(pid: string, fileName: string): Promise<Blob> {
  const res = await api.get(problemEndpoints.file(pid, fileName), {
    responseType: "blob",
  });
  return res.data;
}

/**
 * 导出题目包（Hydro 目录结构的 zip），可直接在“导入题目包”里导回
 * 出错时后端返回 JSON，但 responseType 为 blob，需要自己读出 message
 */
export async function exportProblemPack(pid: string): Promise<Blob> {
  try {
    const res = await api.get(problemEndpoints.exportPack(pid), { responseType: "blob" });
    return res.data;
  } catch (e: any) {
    const data = e?.response?.data;
    let message = "导出失败";
    if (data instanceof Blob) {
      try {
        message = JSON.parse(await data.text())?.message || message;
      } catch {
        // 不是 JSON，保留默认提示
      }
    }
    throw new Error(message);
  }
}
