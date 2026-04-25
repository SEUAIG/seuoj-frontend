import { api } from "@/services/api/axios";
import { userEndpoints } from "@/services/endpoints";
import type {
  BatchImportRequest,
  BatchImportResponse,
  BatchImportResult,
  BatchImportUserRow,
  FailDetail,
  SkipDetail,
  SuccessDetail,
} from "@/models/user";

export type {
  BatchImportRequest,
  BatchImportResponse,
  BatchImportResult,
  BatchImportUserRow,
  FailDetail,
  SkipDetail,
  SuccessDetail,
};

export const batchImportUsers = async (
  req: BatchImportRequest
): Promise<BatchImportResponse> => {
  const response = await api.post<BatchImportResponse>(
    userEndpoints.batchImport,
    req
  );
  return response.data;
};
