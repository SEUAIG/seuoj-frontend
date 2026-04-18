import { api } from "./axios";

export async function exchangeForTempToken(): Promise<string> {
  const res = await api.post("/api/auth/token/exchange");
  console.log("[tokenExchange] 响应数据:", JSON.stringify(res.data));
  if (res.data?.code !== 0 && res.data?.code !== 200) {
    throw new Error(res.data?.message || "换取临时token失败");
  }
  const tempToken = res.data.data?.temp_token;
  if (!tempToken) {
    throw new Error(
      `后端未返回 temp_token，实际 data 字段: ${JSON.stringify(res.data.data)}`
    );
  }
  return tempToken;
}
