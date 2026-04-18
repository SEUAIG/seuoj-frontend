import { api } from "../api/axios";

export interface ProblemSetProgressItem {
    problem_set_public_id: string;
    title: string;
    problem_count: number;
    avg_completion_rate: number;
}

export interface StudentOverviewItem {
    user_public_id: string;
    username: string;
    ac_count: number;
}

export interface ClassOverviewData {
    member_count: number;
    total_problems: number;
    problem_sets: ProblemSetProgressItem[];
    students: StudentOverviewItem[];
}

export interface ClassOverviewResponse {
    code: number;
    message: string;
    data: ClassOverviewData;
}

export const getClassOverview = async (
    classPublicId: string
): Promise<ClassOverviewResponse> => {
    const response = await api.get(`/api/class/${classPublicId}/overview`);
    return response.data;
};
