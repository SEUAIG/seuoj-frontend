import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { UnlinkProblemSetResponse } from "@/models/class";

export type { UnlinkProblemSetResponse };

export const unlinkProblemSet = async (
  classId: number,
  problemSetId: number
): Promise<UnlinkProblemSetResponse> => {
  const response = await api.delete(
    classEndpoints.linkedProblemSetById(classId, problemSetId)
  );
  return response.data;
};
