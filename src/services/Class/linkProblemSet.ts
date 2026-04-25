import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type { LinkProblemSetResponse } from "@/models/class";

export type { LinkProblemSetResponse };

export const linkProblemSet = async (
  classId: number,
  problemSetId: number
): Promise<LinkProblemSetResponse> => {
  const response = await api.put(
    classEndpoints.linkedProblemSetById(classId, problemSetId)
  );
  return response.data;
};
