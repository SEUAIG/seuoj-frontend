import { api } from "./api/axios";

export async function getTestFile(pid:string)
{
    const res = await api.get(`/api/problem/tree/${pid}`);
    return res.data.data
}