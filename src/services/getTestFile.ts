import { api } from "./api/axios";

export async function getTestFile(pid:string)
{
    const res = await api.get(`/api/problem/tree/${pid}`);
    return res.data.data
}

/**
 * 通过 axios 下载题目文件（携带 JWT）
 * 返回的是 Blob，调用方可用 URL.createObjectURL 触发浏览器下载
 */
export async function downloadProblemFile(pid: string, fileName: string): Promise<Blob> {
    const res = await api.get(`/api/problem/file/${pid}/${fileName}`, {
        responseType: 'blob',
    });
    return res.data;
}