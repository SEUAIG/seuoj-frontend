import { api } from "../api/axios";

export interface ProblemColumn {
    pid: string;
    title: string;
    sort_order: number;
}

export interface StudentRow {
    username: string;
    nickname?: string;
    user_id: number;
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
    classId: number,
    problemSetId: number
): Promise<ClassProblemSetMatrixResponse> => {
    const response = await api.get(
        `/api/class/${classId}/problem_set/${problemSetId}/matrix`
    );
    return response.data;
};
