import { api } from "../api/axios";
export interface RegisterContestResponse {
  code: number;
  message: string;
}
export const registerContest = async (
  contestId: number
): Promise<RegisterContestResponse> => {
  const res = await api.post<RegisterContestResponse>(
    `/api/contest/register?contest_id=${contestId}`
  );
  return res.data;
};
export const unregisterContest = async (
  contestId: number
): Promise<RegisterContestResponse> => {
  const res = await api.delete<RegisterContestResponse>(
    `/api/contest/register?contest_id=${contestId}`
  );
  return res.data;
};
