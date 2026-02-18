import { api } from "../api/axios";

export type ContestUnregisterQuery = {
  contest_public_id?: string;
};
export type ContestUnregisterResponse = {
  code: number;
  message: string;
};

export const unregisterContest = async (
  params: ContestUnregisterQuery
): Promise<ContestUnregisterResponse> => {
  const res = await api.delete<ContestUnregisterResponse>(
    "/api/contest/register",
    { params }
  );
  return res.data;
};
