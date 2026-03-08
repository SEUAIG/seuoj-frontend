import { api } from "../api/axios";

export type ProblemSetProblemItem = {
    pid: string;
    title: string;
    sort_order: string;
};

export type ProblemSetDetailData = {
    problem_set_id?: string;
    title?: string;
    description?: string;
    is_public?: boolean;
    problem_list?: ProblemSetProblemItem[];
};

export type ProblemSetDetailResponse = {
    code: number;
    message: string;
    data?: ProblemSetDetailData;
};

export const getProblemSetDetail = async (
    problem_set_public_id: string
): Promise<ProblemSetDetailData | undefined> => {
    const res = await api.get<ProblemSetDetailResponse>(
        `/api/problem_set/${problem_set_public_id}`
    );
    return res.data.data;
};
