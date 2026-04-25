import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { LinkContestResponse } from "@/models/class";

export type { LinkContestResponse };

export const linkContest = async (
  classId: number,
  contestId: number
): Promise<LinkContestResponse> => {
  const response = await api.put(classEndpoints.linkedContestById(classId, contestId));
  return response.data;
};
