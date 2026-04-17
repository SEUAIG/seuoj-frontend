import { api } from "../api/axios";

export interface ProblemColumn {
    pid: string;
    title: string;
    sort_order: number;
}

export interface StudentRow {
    username: string;
    user_public_id: string;
    cells: string[];
    ac_count: number;
}

export interface ClassProblemSetMatrixData {
    problem_set_title: string;
    problems: ProblemColumn[];
    students: StudentRow[];
}

export interface ClassProblemSetMatrixResponse {
    code: number;
    message: string;
    data: ClassProblemSetMatrixData;
}

export const getClassProblemSetMatrix = async (
    classPublicId: string,
    problemSetPublicId: string
): Promise<ClassProblemSetMatrixResponse> => {
    const response = await api.get(
        `/api/class/${classPublicId}/problem_set/${problemSetPublicId}/matrix`
    );
    return response.data;
};
