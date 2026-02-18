import { api } from "../api/axios";

export type ContestRegisterQuery = {
  contest_public_id?: string;
};
export type ContestRegisterResponse = {
  code: number;
  message: string;
};

export const registerContest = async (
  params: ContestRegisterQuery
): Promise<ContestRegisterResponse> => {
  const res = await api.post<ContestRegisterResponse>(
    "/api/contest/register",
    undefined,
    { params }
  );
  return res.data;
};
