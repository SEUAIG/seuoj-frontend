import { api } from "../api/axios";
import { assignmentEndpoints } from "@/services/endpoints";
import type {
  ImportFromProblemSetRequest,
  ImportFromProblemSetResponse,
} from "@/models/assignment";

export type { ImportFromProblemSetRequest, ImportFromProblemSetResponse };

export const importFromProblemSet = async (
  classId: number,
  assignmentId: number,
  data: ImportFromProblemSetRequest
): Promise<ImportFromProblemSetResponse> => {
  const response = await api.post(
    assignmentEndpoints.importFromProblemSet(classId, assignmentId),
    data
  );
  return response.data;
};
