import { api } from "./api/axios";
export async function updateProblem(payload: unknown) {
  const res = await api.patch("/api/problem/edit", payload);
  return res.data;
}
export async function uploadProblemTestcases(
  pid: string,
  file: File,
  format: string
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);
  const res = await api.post(`/api/problem/testcases/${pid}`, formData);
  return res.data;
}
