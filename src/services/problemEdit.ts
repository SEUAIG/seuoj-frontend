import { api } from "./api/axios";
import { problemEndpoints } from "@/services/endpoints";

export async function updateProblem(payload: unknown) {
  const res = await api.patch(problemEndpoints.edit, payload);
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
  const res = await api.post(problemEndpoints.data(pid), formData);
  return res.data;
}
