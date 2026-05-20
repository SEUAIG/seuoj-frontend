import { api } from "@/services/api/axios";
import { submissionEndpoints } from "@/services/endpoints";
import type { LanguagesResponse } from "@/models/submission";

export const getLanguages = async (): Promise<LanguagesResponse> => {
  const res = await api.get<LanguagesResponse>(submissionEndpoints.languages);
  return res.data;
};