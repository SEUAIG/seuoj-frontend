import { api } from "../api/axios";
import { problemSetEndpoints } from "@/services/endpoints";
import type {
  UpdateProblemSetProblemItem,
  UpdateProblemSetRequest,
  UpdateProblemSetResponse,
} from "@/models/problemSet";

export type {
  UpdateProblemSetProblemItem,
  UpdateProblemSetRequest,
  UpdateProblemSetResponse,
};

export const updateProblemSet = async (
  problemSetId: number,
  data: UpdateProblemSetRequest
): Promise<UpdateProblemSetResponse> => {
  const res = await api.put<UpdateProblemSetResponse>(
    problemSetEndpoints.byId(problemSetId),
    data
  );
  return res.data;
};
