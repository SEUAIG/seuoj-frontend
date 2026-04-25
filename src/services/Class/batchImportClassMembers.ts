import { api } from "@/services/api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  ClassBatchImportRequest as ClassBatchImportRequestModel,
  ClassBatchImportResponse as ClassBatchImportResponseModel,
  ClassBatchImportResult as ClassBatchImportResultModel,
  ClassBatchRowResult,
  ClassBatchStudentRow,
} from "@/models/class";

export type StudentRow = ClassBatchStudentRow;
export type ClassBatchImportRequest = ClassBatchImportRequestModel;
export type RowResult = ClassBatchRowResult;
export type ClassBatchImportResult = ClassBatchImportResultModel;
export type ClassBatchImportResponse = ClassBatchImportResponseModel;

export const batchImportClassMembers = async (
  classId: number,
  req: ClassBatchImportRequest
): Promise<ClassBatchImportResponse> => {
  const response = await api.post<ClassBatchImportResponse>(
    classEndpoints.batchImportMembers(classId),
    req
  );
  return response.data;
};
