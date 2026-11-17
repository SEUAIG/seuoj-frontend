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

/** responseType 为 blob 时，后端的 JSON 错误也是 Blob，需要自己读出 message */
async function blobErrorMessage(e: any, fallback: string): Promise<string> {
  const data = e?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.message || fallback;
    } catch {
      // 不是 JSON，保留默认提示
    }
  }
  return fallback;
}

/** 导出题目包（Hydro 目录结构的 zip），可直接在“导入题目包”里导回 */
export async function exportProblemPack(pid: string): Promise<Blob> {
  try {
    const res = await api.get(problemEndpoints.exportPack(pid), { responseType: "blob" });
    return res.data;
  } catch (e) {
    throw new Error(await blobErrorMessage(e, "导出失败"));
  }
}

/** 选中的测试文件打成一个 zip 下载；文件名相对 data 目录 */
export async function downloadProblemFilesZip(pid: string, files: string[]): Promise<Blob> {
  try {
    const res = await api.post(problemEndpoints.filesZip(pid), { files }, { responseType: "blob" });
    return res.data;
  } catch (e) {
    throw new Error(await blobErrorMessage(e, "打包下载失败"));
  }
}
