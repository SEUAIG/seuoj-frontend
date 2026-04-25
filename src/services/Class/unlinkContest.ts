import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { UnlinkContestResponse } from "@/models/class";

export type { UnlinkContestResponse };

export const unlinkContest = async (
  classId: number,
  contestId: number
): Promise<UnlinkContestResponse> => {
  const response = await api.delete(classEndpoints.linkedContestById(classId, contestId));
  return response.data;
};
