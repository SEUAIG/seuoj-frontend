import axios from "axios";
import { ENV } from "@/config/env";
import { problemEndpoints } from "@/services/endpoints";

export async function getTags() {
  // 使用原生 axios 实例，避开全局拦截器的 Token 注入
  const res = await axios.get(`${ENV.API_BASE_URL}${problemEndpoints.tags}`);
  if (res.data.code !== 0) {
    throw new Error(res.data.msg || "获取标签失败");
  }
  return res.data.data;
}
