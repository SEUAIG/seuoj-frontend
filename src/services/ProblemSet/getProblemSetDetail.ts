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
    can_write?: boolean;
};

export type ProblemSetDetailResponse = {
    code: number;
    message: string;
    data?: ProblemSetDetailData;
};

export const getProblemSetDetail = async (
    problemSetId: number
): Promise<ProblemSetDetailData | undefined> => {
    const res = await api.get<ProblemSetDetailResponse>(
        `/api/problem_set/${problemSetId}`
    );
    return res.data.data;
};
