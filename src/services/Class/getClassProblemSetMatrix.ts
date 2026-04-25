import { api } from "../api/axios";
import { classEndpoints } from "@/services/endpoints";
import type {
  ClassMatrixStudentRow,
  ClassProblemColumn,
  ClassProblemSetMatrixData,
  ClassProblemSetMatrixResponse,
} from "@/models/class";

export type ProblemColumn = ClassProblemColumn;
export type StudentRow = ClassMatrixStudentRow;
export type { ClassProblemSetMatrixData, ClassProblemSetMatrixResponse };

export const getClassProblemSetMatrix = async (
  classId: number,
  problemSetId: number
): Promise<ClassProblemSetMatrixResponse> => {
  const response = await api.get(
    classEndpoints.problemSetMatrix(classId, problemSetId)
  );
  return response.data;
};
