import axios from "axios";
import { ENV } from "@/config/env";

export async function getTags(){
    // 使用原生 axios 实例，避开全局拦截器的 Token 注入
    const res = await axios.get(`${ENV.API_BASE_URL}/api/problem/tag`);
    return res.data.data
}