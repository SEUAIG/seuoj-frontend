import { api } from "../api/axios";
export interface RegisterContestResponse {
  code: number;
  message: string;
}
export const registerContest = async (
  contest_public_id: string
): Promise<RegisterContestResponse> => {
  const res = await api.post<RegisterContestResponse>(
    `/api/contest/register?contest_public_id=${contest_public_id}`
  );
  return res.data;
};
export const unregisterContest = async (
  contest_public_id: string
): Promise<RegisterContestResponse> => {
  const res = await api.delete<RegisterContestResponse>(
    `/api/contest/register?contest_public_id=${contest_public_id}`
  );
  return res.data;
};
